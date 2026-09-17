import React, { useRef } from "react";
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORY_ICONS, CATEGORY_LABELS, QuestWithDistance, groupLabels } from "../types";
import { colors, categoryColors, radius, fontFamily } from "../theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

interface Props {
  quest: QuestWithDistance;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  stackIndex: number;
}

export default function QuestCard({ quest, onSwipeLeft, onSwipeRight, isTop, stackIndex }: Props) {
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onMoveShouldSetPanResponder: (_, gesture) => isTop && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4),
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: "left" | "right") => {
    const x = direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      direction === "right" ? onSwipeRight() : onSwipeLeft();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
    }).start();
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  const saveOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const skipOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const animatedStyle = isTop
    ? {
        transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
      }
    : {
        transform: [{ scale: 1 - stackIndex * 0.04 }, { translateY: stackIndex * 10 }],
      };

  const accent = categoryColors[quest.category];
  const badges = groupLabels(quest.minGroupSize, quest.maxGroupSize);

  return (
    <Animated.View
      style={[styles.card, animatedStyle, { zIndex: 100 - stackIndex }]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <Text style={styles.eyebrow}>NEW QUEST</Text>

      <View style={styles.imageWrap}>
        <Image source={{ uri: quest.imageUrl }} style={styles.image} />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={colors.text} />
          <Text style={styles.ratingText}>{quest.rating.toFixed(1)}</Text>
        </View>

        {isTop && (
          <>
            <Animated.View style={[styles.stamp, styles.saveStamp, { opacity: saveOpacity }]}>
              <Text style={[styles.stampText, { color: colors.brand }]}>SAVE</Text>
            </Animated.View>
            <Animated.View style={[styles.stamp, styles.skipStamp, { opacity: skipOpacity }]}>
              <Text style={[styles.stampText, { color: colors.secondary }]}>SKIP</Text>
            </Animated.View>
          </>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: accent + "26" }]}>
            <Ionicons name={CATEGORY_ICONS[quest.category] as any} size={13} color={accent} />
            <Text style={[styles.categoryBadgeText, { color: accent }]}>{CATEGORY_LABELS[quest.category]}</Text>
          </View>
          {badges.map((b) => (
            <Text key={b} style={styles.groupBadge}>
              {b}
            </Text>
          ))}
        </View>

        <Text style={styles.title}>{quest.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {quest.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {quest.distanceKm === null ? "? km" : `${quest.distanceKm.toFixed(1)} km`}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{quest.price === 0 ? "Gratis" : `€${quest.price}`}</Text>
          {quest.durationMinutes ? (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{quest.durationMinutes} min</Text>
            </>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const IMAGE_HEIGHT = CARD_WIDTH * 0.95;

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  eyebrow: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textMuted,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  imageWrap: {
    width: "100%",
    height: IMAGE_HEIGHT,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.chip,
    gap: 4,
  },
  ratingText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.chip,
    gap: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    marginLeft: 4,
  },
  groupBadge: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.textMuted,
    marginRight: 8,
    marginBottom: 4,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.text,
  },
  metaDot: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    marginHorizontal: 8,
  },
  stamp: {
    position: "absolute",
    top: 20,
    borderWidth: 2.5,
    borderRadius: radius.chip,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  saveStamp: {
    left: 16,
    borderColor: colors.brand,
    transform: [{ rotate: "-12deg" }],
  },
  skipStamp: {
    right: 16,
    borderColor: colors.secondary,
    transform: [{ rotate: "12deg" }],
  },
  stampText: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    letterSpacing: 1,
  },
});

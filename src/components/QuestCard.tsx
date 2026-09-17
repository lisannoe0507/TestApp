import React, { useRef } from "react";
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORY_ICONS, CATEGORY_LABELS, QuestWithDistance, groupLabels } from "../types";
import { colors, categoryColors, radius, fontFamily } from "../theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
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
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      direction === "right" ? onSwipeRight() : onSwipeLeft();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
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
      <Image source={{ uri: quest.imageUrl }} style={styles.image} />

      <View style={styles.topRow}>
        <View style={[styles.categoryBadge, { backgroundColor: accent }]}>
          <Ionicons name={CATEGORY_ICONS[quest.category] as any} size={13} color={colors.surface} />
          <Text style={styles.categoryBadgeText}>{CATEGORY_LABELS[quest.category]}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={colors.text} />
          <Text style={styles.ratingText}>{quest.rating.toFixed(1)}</Text>
        </View>
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

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.15)", "rgba(11,27,51,0.88)"]}
        locations={[0, 0.5, 1]}
        style={styles.overlay}
      >
        {badges.length > 0 && (
          <View style={styles.groupRow}>
            {badges.map((b) => (
              <View key={b} style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{b}</Text>
              </View>
            ))}
          </View>
        )}

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
      </LinearGradient>
    </Animated.View>
  );
}

const CARD_WIDTH = SCREEN_WIDTH * 0.9;
// Sized off screen height (not just width) so it always leaves room for the
// action buttons under it, regardless of the device's aspect ratio.
const CARD_HEIGHT = SCREEN_HEIGHT * 0.62;

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  topRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.chip,
    gap: 4,
  },
  categoryBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.surface,
    marginLeft: 4,
  },
  ratingBadge: {
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
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  groupRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  groupBadge: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.chip,
    marginRight: 6,
  },
  groupBadgeText: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.surface,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: colors.surface,
    marginBottom: 4,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
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
    color: colors.surface,
  },
  metaDot: {
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.7)",
    marginHorizontal: 8,
  },
  stamp: {
    position: "absolute",
    top: 70,
    borderWidth: 3,
    borderRadius: radius.chip,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    zIndex: 10,
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

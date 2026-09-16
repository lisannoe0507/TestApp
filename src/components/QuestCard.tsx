import React, { useRef } from "react";
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORY_ICONS, CATEGORY_LABELS, QuestWithDistance } from "../types";

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
    outputRange: ["-10deg", "0deg", "10deg"],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
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

  return (
    <Animated.View
      style={[styles.card, animatedStyle, { zIndex: 100 - stackIndex }]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <Image source={{ uri: quest.imageUrl }} style={styles.image} />
      <View style={styles.badgeRow}>
        <View style={styles.categoryBadge}>
          <Ionicons name={CATEGORY_ICONS[quest.category] as any} size={14} color="#fff" />
          <Text style={styles.categoryBadgeText}>{CATEGORY_LABELS[quest.category]}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFD34D" />
          <Text style={styles.ratingText}>{quest.rating.toFixed(1)}</Text>
        </View>
      </View>

      {isTop && (
        <>
          <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={styles.likeStampText}>LEUK!</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeStampText}>NOPE</Text>
          </Animated.View>
        </>
      )}

      <View style={styles.infoOverlay}>
        <Text style={styles.title}>{quest.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {quest.description}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={15} color="#fff" />
            <Text style={styles.metaText}>
              {quest.distanceKm === null ? "? km" : `${quest.distanceKm.toFixed(1)} km`}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={15} color="#fff" />
            <Text style={styles.metaText}>
              {quest.minGroupSize === quest.maxGroupSize
                ? `${quest.minGroupSize}p`
                : `${quest.minGroupSize}-${quest.maxGroupSize}p`}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={15} color="#fff" />
            <Text style={styles.metaText}>{quest.price === 0 ? "Gratis" : `€${quest.price}`}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.35;

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: "#1c1c1e",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  badgeRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  categoryBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "rgba(0,0,0,0.0)",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  description: {
    color: "#f0f0f0",
    fontSize: 14,
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 16,
  },
  metaText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  stamp: {
    position: "absolute",
    top: 40,
    borderWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  likeStamp: {
    left: 24,
    borderColor: "#4ADE80",
    transform: [{ rotate: "-20deg" }],
  },
  likeStampText: {
    color: "#4ADE80",
    fontSize: 30,
    fontWeight: "900",
  },
  nopeStamp: {
    right: 24,
    borderColor: "#F87171",
    transform: [{ rotate: "20deg" }],
  },
  nopeStampText: {
    color: "#F87171",
    fontSize: 30,
    fontWeight: "900",
  },
});

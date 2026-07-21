export const colors = {
  primary: "#3b82f6",
  primarySoft: "#eaf4ff",
  primaryDark: "#17263a",
  white: "#ffffff",
  background: "#f6f8fb",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "#edf2f7",
  borderStrong: "#dbe4f0",
  text: "#1f2937",
  muted: "#64748b",
  danger: "#991b1b",
  warning: "#B45309",
  warningSoft: "#FFF4D6",
  warningAccent: "#F59E0B",
  success: "#15803d",
  successSoft: "#dcfce7"
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999
};

export const shadows = {
  soft: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2
  },
  primary: {
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3
  }
};

export const softShadow = shadows.soft;
export const primaryShadow = shadows.primary;

export const scannerTokens = {
  borderRadius: 18,
  frameStrokeWidth: 4,
  frameWidth: "86%",
  frameHeight: 170
} as const;

export const scannerBorderRadius = scannerTokens.borderRadius;
export const scannerFrameStrokeWidth = scannerTokens.frameStrokeWidth;
export const scannerFrameWidth = scannerTokens.frameWidth;
export const scannerFrameHeight = scannerTokens.frameHeight;

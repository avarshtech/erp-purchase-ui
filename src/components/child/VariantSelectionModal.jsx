import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { getColorHex, isColorAttribute } from "../../utils/colorConstants";

// Render color swatch
const ColorSwatch = ({ colorName, size = 18 }) => {
  const hex = getColorHex(colorName);
  if (!hex) return null;
  
  const isGradient = hex.includes("gradient");
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "6px",
        background: isGradient ? hex : hex,
        backgroundColor: !isGradient ? hex : undefined,
        border: "1px solid rgba(128,128,128,0.3)",
        flexShrink: 0,
        marginRight: 6,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
      title={colorName}
    />
  );
};

// Theme-aware styles
const getStyles = (isDarkMode) => ({
  backdrop: {
    backgroundColor: isDarkMode ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 2200,
  },
  modalContent: {
    backgroundColor: isDarkMode ? "#1a1d21" : "#ffffff",
    border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
    boxShadow: isDarkMode 
      ? "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)" 
      : "0 25px 50px -12px rgba(0,0,0,0.25)",
  },
  header: {
    backgroundColor: isDarkMode ? "#22262b" : "#f8fafc",
    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
  },
  headerIcon: {
    backgroundColor: isDarkMode ? "rgba(99,102,241,0.2)" : "#e0e7ff",
    color: isDarkMode ? "#818cf8" : "#4f46e5",
  },
  title: {
    color: isDarkMode ? "#f1f5f9" : "#1e293b",
  },
  subtitle: {
    color: isDarkMode ? "#94a3b8" : "#64748b",
  },
  itemCard: {
    backgroundColor: isDarkMode ? "#22262b" : "#f8fafc",
    border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
  },
  itemIcon: {
    backgroundColor: isDarkMode ? "rgba(99,102,241,0.15)" : "#e0e7ff",
  },
  itemCode: {
    backgroundColor: isDarkMode ? "rgba(99,102,241,0.2)" : "#e0e7ff",
    color: isDarkMode ? "#a5b4fc" : "#4338ca",
  },
  categoryBadge: {
    backgroundColor: isDarkMode ? "rgba(148,163,184,0.15)" : "#f1f5f9",
    color: isDarkMode ? "#94a3b8" : "#475569",
  },
  itemName: {
    color: isDarkMode ? "#f1f5f9" : "#1e293b",
  },
  itemMeta: {
    color: isDarkMode ? "#64748b" : "#94a3b8",
  },
  variantCount: {
    backgroundColor: isDarkMode ? "rgba(34,197,94,0.15)" : "#dcfce7",
    color: isDarkMode ? "#4ade80" : "#166534",
  },
  variantCard: {
    default: {
      backgroundColor: isDarkMode ? "#22262b" : "#ffffff",
      border: isDarkMode ? "2px solid rgba(255,255,255,0.08)" : "2px solid #e2e8f0",
    },
    hovered: {
      backgroundColor: isDarkMode ? "#2a2f36" : "#f8fafc",
      border: isDarkMode ? "2px solid rgba(99,102,241,0.4)" : "2px solid #a5b4fc",
    },
    selected: {
      backgroundColor: isDarkMode ? "rgba(99,102,241,0.15)" : "#eef2ff",
      border: isDarkMode ? "2px solid #6366f1" : "2px solid #4f46e5",
    },
  },
  indexCircle: {
    default: {
      backgroundColor: isDarkMode ? "rgba(148,163,184,0.15)" : "#f1f5f9",
      color: isDarkMode ? "#64748b" : "#94a3b8",
    },
    selected: {
      backgroundColor: isDarkMode ? "#6366f1" : "#4f46e5",
      color: "#ffffff",
    },
  },
  attributePill: {
    backgroundColor: isDarkMode ? "rgba(148,163,184,0.12)" : "#f1f5f9",
    border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0",
  },
  attributeLabel: {
    color: isDarkMode ? "#94a3b8" : "#64748b",
  },
  attributeValue: {
    color: isDarkMode ? "#e2e8f0" : "#1e293b",
  },
  selectedBadge: {
    backgroundColor: isDarkMode ? "#6366f1" : "#4f46e5",
    color: "#ffffff",
  },
  chevron: {
    default: {
      color: isDarkMode ? "#475569" : "#cbd5e1",
    },
    active: {
      color: isDarkMode ? "#818cf8" : "#4f46e5",
    },
  },
  noVariants: {
    title: {
      color: isDarkMode ? "#e2e8f0" : "#374151",
    },
    text: {
      color: isDarkMode ? "#94a3b8" : "#6b7280",
    },
  },
});

/**
 * VariantSelectionModal
 * Displays a modal for selecting a variant from an item's variants array
 */
const VariantSelectionModal = ({
  show,
  item,
  onSelect,
  onClose,
  selectedVariantId = null,
}) => {
  const [hoveredVariant, setHoveredVariant] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark" ||
                     document.body.classList.contains("dark-mode") ||
                     document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };
    
    checkDarkMode();
    
    // Observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["data-theme", "class"] 
    });
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ["class"] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Reset hover state when modal opens/closes
  useEffect(() => {
    if (!show) {
      setHoveredVariant(null);
    }
  }, [show]);

  if (!show || !item) return null;

  const variants = (item.variants || []).filter((v) => v.isActive !== false);
  const hasVariants = variants.length > 0;
  const styles = getStyles(isDarkMode);

  const handleSelectVariant = (variant) => {
    if (onSelect) {
      onSelect(item, variant);
    }
  };

  const getVariantCardStyle = (isSelected, isHovered) => {
    if (isSelected) return styles.variantCard.selected;
    if (isHovered) return styles.variantCard.hovered;
    return styles.variantCard.default;
  };

  return (
    <div
      className="modal fade show d-block"
      style={styles.backdrop}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "700px" }}
      >
        <div 
          className="modal-content"
          style={{
            ...styles.modalContent,
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div 
            className="py-16 px-24"
            style={styles.header}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ 
                  width: 48, 
                  height: 48,
                  borderRadius: "14px",
                  ...styles.headerIcon,
                }}
              >
                <Icon
                  icon="mdi:palette-swatch-variant"
                  width="26"
                  height="26"
                />
              </div>
              <div>
                <h5 
                  className="mb-0 fw-bold"
                  style={{ ...styles.title, fontSize: "1.15rem" }}
                >
                  Select Variant
                </h5>
                <p 
                  className="text-sm mb-0"
                  style={{ ...styles.subtitle, marginTop: "2px" }}
                >
                  Choose a variant for this item
                </p>
              </div>
            </div>
          </div>

          {/* Item Info Card */}
          <div className="px-24 pt-20">
            <div 
              className="d-flex align-items-center gap-3 p-16"
              style={{
                ...styles.itemCard,
                borderRadius: "16px",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ 
                  width: 52, 
                  height: 52, 
                  flexShrink: 0,
                  borderRadius: "12px",
                  ...styles.itemIcon,
                }}
              >
                <Icon
                  icon="mdi:package-variant-closed"
                  width="28"
                  height="28"
                  className="text-primary-600"
                />
              </div>
              <div className="flex-grow-1 min-width-0">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span 
                    className="badge text-xs fw-semibold"
                    style={{
                      ...styles.itemCode,
                      padding: "4px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {item.itemCode}
                  </span>
                  {item.categoryName && (
                    <span 
                      className="badge text-xs"
                      style={{
                        ...styles.categoryBadge,
                        padding: "4px 10px",
                        borderRadius: "6px",
                      }}
                    >
                      {item.categoryName}
                    </span>
                  )}
                </div>
                <h6 
                  className="mb-0 fw-semibold text-truncate"
                  style={styles.itemName}
                >
                  {item.itemName}
                </h6>
                <div className="text-xs mt-1" style={styles.itemMeta}>
                  {item.subCategoryName && <span>{item.subCategoryName}</span>}
                  {item.subCategoryName && item.itemTypeName && <span> • </span>}
                  {item.itemTypeName && <span>{item.itemTypeName}</span>}
                </div>
              </div>
              <div className="text-end">
                <span 
                  className="badge text-sm fw-semibold"
                  style={{
                    ...styles.variantCount,
                    padding: "6px 12px",
                    borderRadius: "8px",
                  }}
                >
                  {variants.length} Variant{variants.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Variants List */}
          <div 
            className="px-24 py-20" 
            style={{ 
              maxHeight: "420px", 
              overflowY: "auto",
            }}
          >
            {!hasVariants ? (
              <div className="text-center py-32">
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-16"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "18px",
                    backgroundColor: isDarkMode ? "rgba(251,191,36,0.15)" : "#fef3c7",
                  }}
                >
                  <Icon
                    icon="mdi:alert-circle-outline"
                    width="36"
                    height="36"
                    style={{ color: isDarkMode ? "#fbbf24" : "#d97706" }}
                  />
                </div>
                <h6 className="fw-semibold" style={styles.noVariants.title}>
                  No Variants Available
                </h6>
                <p className="text-sm mb-0" style={styles.noVariants.text}>
                  This item does not have any active variants.
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-12">
                {variants.map((variant, index) => {
                  const isSelected = selectedVariantId === variant.id;
                  const isHovered = hoveredVariant === variant.id;
                  const cardStyle = getVariantCardStyle(isSelected, isHovered);

                  return (
                    <div 
                      key={variant.id}
                      className="variant-card p-16"
                      style={{
                        ...cardStyle,
                        borderRadius: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => handleSelectVariant(variant)}
                      onMouseEnter={() => setHoveredVariant(variant.id)}
                      onMouseLeave={() => setHoveredVariant(null)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        {/* Selection indicator */}
                        <div
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "10px",
                            transition: "all 0.2s ease",
                            ...(isSelected ? styles.indexCircle.selected : styles.indexCircle.default),
                          }}
                        >
                          {isSelected ? (
                            <Icon icon="mdi:check" width="20" height="20" />
                          ) : (
                            <span className="text-sm fw-bold">{index + 1}</span>
                          )}
                        </div>

                        {/* Variant details */}
                        <div className="flex-grow-1">
                          {/* Attributes */}
                          <div className="d-flex flex-wrap gap-2 align-items-center">
                            {isSelected && (
                              <span 
                                className="badge text-xs fw-semibold me-1"
                                style={{
                                  ...styles.selectedBadge,
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                }}
                              >
                                Selected
                              </span>
                            )}
                            {variant.attributes &&
                              Object.entries(variant.attributes).map(([key, value]) => {
                                return (
                                  <div
                                    key={key}
                                    className="d-flex align-items-center gap-1 px-12 py-6"
                                    style={{
                                      ...styles.attributePill,
                                      borderRadius: "8px",
                                    }}
                                  >
                                    {isColorAttribute(key) && <ColorSwatch colorName={value} size={16} />}
                                    <span 
                                      className="text-xs text-capitalize"
                                      style={styles.attributeLabel}
                                    >
                                      {key}:
                                    </span>
                                    <span 
                                      className="text-xs fw-semibold"
                                      style={styles.attributeValue}
                                    >
                                      {value}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <div
                          className="d-flex align-items-center"
                          style={isSelected || isHovered ? styles.chevron.active : styles.chevron.default}
                        >
                          <Icon icon="mdi:chevron-right" width="24" height="24" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantSelectionModal;

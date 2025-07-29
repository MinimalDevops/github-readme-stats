// @ts-check
import { Card } from "../common/Card.js";
import { icons } from "../common/icons.js";
import {
  clampValue,
  flexLayout,
  getCardColors,
  kFormatter,
  measureText,
} from "../common/utils.js";

const CARD_MIN_WIDTH = 287;
const CARD_DEFAULT_WIDTH = 287;

/**
 * Create a medium stats card text item.
 *
 * @param {object} createTextNodeParams Object that contains the createTextNode parameters.
 * @param {string} createTextNodeParams.icon The icon to display.
 * @param {string} createTextNodeParams.label The label to display.
 * @param {number} createTextNodeParams.value The value to display.
 * @param {string} createTextNodeParams.id The id of the stat.
 * @param {number} createTextNodeParams.index The index of the stat.
 * @param {boolean} createTextNodeParams.showIcons Whether to show icons.
 * @param {number} createTextNodeParams.shiftValuePos Number of pixels the value has to be shifted to the right.
 * @param {boolean} createTextNodeParams.bold Whether to bold the label.
 * @param {string} createTextNodeParams.number_format The format of numbers on card.
 * @returns {string} The medium stats card text item SVG object.
 */
const createTextNode = ({
  icon,
  label,
  value,
  id,
  index,
  showIcons,
  shiftValuePos,
  bold,
  number_format,
}) => {
  const kValue =
    number_format.toLowerCase() === "long" ? value : kFormatter(value);
  const staggerDelay = (index + 3) * 150;

  const labelOffset = showIcons ? `x="25"` : "";
  const iconSvg = showIcons
    ? `
    <svg data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
      ${icon}
    </svg>
  `
    : "";
  return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms" transform="translate(25, 0)">
      ${iconSvg}
      <text class="stat ${
        bold ? " bold" : "not_bold"
      }" ${labelOffset} y="12.5">${label}:</text>
      <text
        class="stat ${bold ? " bold" : "not_bold"}"
        x="${(showIcons ? 140 : 120) + shiftValuePos}"
        y="12.5"
        data-testid="${id}"
      >${kValue}</text>
    </g>
  `;
};

/**
 * Retrieves CSS styles for a card.
 *
 * @param {Object} colors The colors to use for the card.
 * @param {string} colors.titleColor The title color.
 * @param {string} colors.textColor The text color.
 * @param {string} colors.iconColor The icon color.
 * @param {boolean} colors.show_icons Whether to show icons.
 * @returns {string} Card CSS styles.
 */
const getStyles = ({
  // eslint-disable-next-line no-unused-vars
  titleColor,
  textColor,
  iconColor,
  show_icons,
}) => {
  return `
    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${textColor};
    }
    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .stat { font-size:12px; }
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }
    
    .not_bold { font-weight: 400 }
    .bold { font-weight: 700 }
    .icon {
      fill: ${iconColor};
      display: ${show_icons ? "block" : "none"};
    }
  `;
};

/**
 * @typedef {import('../fetchers/types').MediumData} MediumData
 * @typedef {import('./types').MediumCardOptions} MediumCardOptions
 */

/**
 * Renders the medium stats card.
 *
 * @param {MediumData} stats The medium stats data.
 * @param {Partial<MediumCardOptions>} options The card options.
 * @returns {string} The medium stats card SVG object.
 */
const renderMediumCard = (stats, options = {}) => {
  const { totalViews, totalReads } = stats;
  const {
    show_icons = false,
    hide_title = false,
    hide_border = false,
    card_width,
    line_height = 25,
    title_color,
    icon_color,
    text_color,
    text_bold = true,
    bg_color,
    theme = "default",
    custom_title,
    border_radius,
    border_color,
    number_format = "short",
    locale,
    disable_animations = false,
  } = options;

  const lheight = parseInt(String(line_height), 10);

  // returns theme based colors with proper overrides and defaults
  const { titleColor, iconColor, textColor, bgColor, borderColor } =
    getCardColors({
      title_color,
      text_color,
      icon_color,
      bg_color,
      border_color,
      theme,
    });

  // Meta data for creating text nodes with createTextNode function
  const STATS = {};

  STATS.views = {
    icon: icons.star, // Using star icon as placeholder for views
    label: "Total Views",
    value: totalViews,
    id: "views",
  };

  STATS.reads = {
    icon: icons.contribs, // Using contribs icon as placeholder for reads
    label: "Total Reads",
    value: totalReads,
    id: "reads",
  };

  const longLocales = [
    "cn",
    "es",
    "fr",
    "pt-br",
    "ru",
    "uk-ua",
    "id",
    "ml",
    "my",
    "pl",
    "de",
    "nl",
    "zh-tw",
    "uz",
  ];
  const isLongLocale = locale ? longLocales.includes(locale) : false;

  // create the text nodes
  const statItems = Object.keys(STATS).map((key, index) =>
    // create the text nodes, and pass index so that we can calculate the line spacing
    createTextNode({
      icon: STATS[key].icon,
      label: STATS[key].label,
      value: STATS[key].value,
      id: STATS[key].id,
      index,
      showIcons: show_icons,
      shiftValuePos: 79.01 + (isLongLocale ? 50 : 0),
      bold: text_bold,
      number_format,
    }),
  );

  // Calculate the card height depending on how many items there are
  let height = 45 + (statItems.length + 1) * lheight;

  const cssStyles = getStyles({
    titleColor,
    textColor,
    iconColor,
    show_icons,
  });

  const calculateTextWidth = () => {
    return measureText(
      custom_title ? custom_title : "Minimal Devops' Medium Stats",
    );
  };

  const iconWidth = show_icons && statItems.length ? 16 + /* padding */ 1 : 0;
  const minCardWidth =
    clampValue(
      50 /* padding */ + calculateTextWidth() * 2,
      CARD_MIN_WIDTH,
      Infinity,
    ) + iconWidth;
  const defaultCardWidth = CARD_DEFAULT_WIDTH + iconWidth;
  let width = card_width
    ? isNaN(card_width)
      ? defaultCardWidth
      : card_width
    : defaultCardWidth;
  if (width < minCardWidth) {
    width = minCardWidth;
  }

  const card = new Card({
    customTitle: custom_title,
    defaultTitle: "Minimal Devops' Medium Stats",
    width,
    height,
    border_radius,
    colors: {
      titleColor,
      textColor,
      iconColor,
      bgColor,
      borderColor,
    },
  });

  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  card.setCSS(cssStyles);

  if (disable_animations) {
    card.disableAnimations();
  }

  // Accessibility Labels
  const labels = Object.keys(STATS)
    .map((key) => `${STATS[key].label}: ${STATS[key].value}`)
    .join(", ");

  card.setAccessibilityLabel({
    title: card.title,
    desc: labels,
  });

  return card.render(`
    <svg x="0" y="0">
      ${flexLayout({
        items: statItems,
        gap: lheight,
        direction: "column",
      }).join("")}
    </svg>
  `);
};

export { renderMediumCard };
export default renderMediumCard;

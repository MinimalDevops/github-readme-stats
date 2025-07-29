// @ts-check
import { renderMediumCard } from "../src/cards/medium-card.js";
import { fetchMediumStats } from "../src/fetchers/medium-fetcher.js";
import {
  clampValue,
  CONSTANTS,
  parseBoolean,
  logger,
} from "../src/common/utils.js";

export default async (req, res) => {
  const {
    show_icons,
    hide_title,
    hide_border,
    card_width,
    line_height,
    title_color,
    icon_color,
    text_color,
    text_bold,
    bg_color,
    theme,
    custom_title,
    border_radius,
    border_color,
    number_format,
    locale,
    disable_animations,
    cache_seconds,
  } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");

  try {
    const stats = await fetchMediumStats();

    // Handle cache=clear parameter
    if (req.query.cache === "clear") {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    } else {
      let cacheSeconds = clampValue(
        parseInt(cache_seconds || CONSTANTS.CARD_CACHE_SECONDS, 10),
        CONSTANTS.TWELVE_HOURS,
        CONSTANTS.TWO_DAY,
      );
      cacheSeconds = process.env.CACHE_SECONDS
        ? parseInt(process.env.CACHE_SECONDS, 10) || cacheSeconds
        : cacheSeconds;

      res.setHeader(
        "Cache-Control",
        `max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=${CONSTANTS.ONE_DAY}`,
      );
    }

    return res.send(
      renderMediumCard(stats, {
        show_icons: parseBoolean(show_icons),
        hide_title: parseBoolean(hide_title),
        hide_border: parseBoolean(hide_border),
        card_width: parseInt(card_width, 10),
        line_height,
        title_color,
        icon_color,
        text_color,
        text_bold: parseBoolean(text_bold),
        bg_color,
        theme,
        custom_title,
        border_radius,
        border_color,
        number_format,
        locale: locale ? locale.toLowerCase() : null,
        disable_animations: parseBoolean(disable_animations),
      }),
    );
  } catch (error) {
    logger.error(error);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(500).send({
      error: "Something went wrong",
      message: error.message,
    });
  }
};

import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import Parser from "rss-parser";
import Filter from "bad-words";
import http from "https";
import { GoogleGenerativeAI } from "@google/generative-ai";

let parser = new Parser();
let filter = new Filter();

const blogFeeds = process.env.BLOG_FEEDS?.split(",");

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateText(prompt, maxTokens) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    return generatedText;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw error;
  }
}

async function generateImage(prompt, imageName) {
  // Gemini tidak memiliki kemampuan generate image seperti DALL-E
  // Untuk generate image, Anda perlu menggunakan layanan lain seperti:
  // - Stable Diffusion
  // - Midjourney API
  // - atau tetap menggunakan OpenAI DALL-E

  console.log(
    "Image generation not supported with Gemini in this implementation"
  );
  return null;
}

/**
 * Retrieve a specific feed
 * @param {string} feed
 * @returns
 */
async function getFeed(feed) {
  return await parser.parseURL(feed);
}

/**
 * Retrieve a list of feeds
 * @param {string[]} feeds
 * @returns
 */
async function getAllFeeds(feeds) {
  return await Promise.all(feeds.map(getFeed));
}

// ... (fungsi-fungsi bantu lainnya tetap sama)

let feeds = await getAllFeeds(blogFeeds);

let feedsItems = [];

feeds.forEach((feed) => {
  feed?.items?.forEach((item) => {
    feedsItems.push(item);
  });
});

var item = selectFeedItem(feedsItems);

addPublishedArticle(item.guid);

const articleTitle = await generateText(
  `Rewrite this title "${item.title}"`,
  100
);

item.title = getFilteredAndSanitezedText(articleTitle);
item.content = getFilteredAndSanitezedText(item.content);

const articleBody = await generateText(
  `Create an article about "${
    item.title
  }" considering this content "${item.content.substring(
    0,
    1024
  )}", format as markdown, exclude title`,
  2048
);

item.body = articleBody;

const articleSnippet = await generateText(
  `Create a synthetic version of this text: "${item.body}"`,
  25
);

item.snippet = getSanitizedText(articleSnippet);

const articleTags = await generateText(
  `Create a comma separated list of tags (single words) for this blog article: "${item.body}"`,
  10
);

let tags = articleTags.split(",");

item.tags = [];
if (tags && tags.length > 0) {
  tags.forEach((tag) => {
    if (tag) {
      let sanitizedTag = getSanitizedText(tag, "", true);
      item.tags.push(sanitizedTag);
    }
  });
}

let fileName = getSanitizedText(item.title, "-", true);

// Generate image menggunakan service lain atau skip
// generateImage(`Thumbnail photo image for the article "${item.title}", no text`, fileName);

let frontMatter = getFrontmatter(item);

generateMarkdownArticle(fileName, frontMatter, articleBody);

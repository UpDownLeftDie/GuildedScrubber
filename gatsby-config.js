const adapter = require("gatsby-adapter-netlify").default
/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Guilded Scrubber`,
    siteUrl: `https://www.guildedscrubber.com`,
  },
  plugins: ['gatsby-plugin-sass'],
  adapter: adapter({
    excludeDatastoreFromEngineFunction: false,
  }),
}

// Used this article to configure project to use sass, while customizing antd with less - https://dev.to/burhanuday/using-ant-design-with-nextjs-custom-variables-for-ant-design-57m5
// Had to install "sass" as well for it to work
const withSass = require("@zeit/next-sass")
const withLess = require("@zeit/next-less")
const withCSS = require("@zeit/next-css")
const { nextI18NextRewrites } = require('next-i18next/rewrites')

const isProd = process.env.NODE_ENV === "production"
const localeSubpaths = {}

// fix: prevents error when .less files are required by node
if (typeof require !== "undefined") {
    require.extensions[".less"] = (file) => { }
}

module.exports = withCSS({
    cssModules: true,
    cssLoaderOptions: {
        importLoaders: 1,
        localIdentName: "[local]___[hash:base64:5]",
    },
    ...withLess(
        withSass({
            lessLoaderOptions: {
                javascriptEnabled: true,
            },
        })
    ),
    rewrites: async () => nextI18NextRewrites(localeSubpaths),
    publicRuntimeConfig: {
        localeSubpaths,
    },
})
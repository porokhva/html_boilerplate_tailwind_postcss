class TailwindExtractor {
  static extract(content) {
    return content.match(/[\w-/:]+(?<!:)/g);
  }
}
module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss"),
    require("postcss-nested"),
    require("autoprefixer")
    //   require("@fullhuman/postcss-purgecss")({
    //     content: ["./public/**/*.html"],
    //     extractors: [{ extractor: TailwindExtractor, extensions: ["html"] }]
    //   }),
    //   require("cssnano")({ preset: "default" })
  ]
};

module.exports = {
  plugins: [
    require('postcss-mixins')(),
    require('postcss-nested')(),
    require('postcss-short')(),
    require('postcss-pxtorem')(),
    require('autoprefixer')()
  ]
}
import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./src/app.js'],
  bundle: true,
  platform: "node",
  outfile: './src/genCalcs.js',
})
module.exports = {
  presets: [
    "@babel/preset-typescript",
    ["@babel/preset-env", { targets: { node: "current" }, loose: false }],
  ],
  plugins: [
    "babel-plugin-transform-typescript-metadata",
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: false }],
    [
      "module-resolver", { alias: { 
        "@middlewares": "./src/infra/http/middlewares",
        "@helpers": "./src/helpers",
        "@handlers": "./src/handlers",
        "@config": "./src/infra/config",
        "@http": "./src/infra/http",
        "@commons": "./src/common",
        "@models": "./src/application/models",
        "@infra": "./src/infra",
        "@containers": "./src/infra/containers",
        "@controllers": "./src/infra/http/controllers",
        "@services": "./src/application/services",
        "@providers": "./src/providers",
        "@repositories": "./src/infra/database/repositories",
        "@mqtt": "./src/infra/mqtt",
        "@domains": "./src/application/domains",
      }}
    ],
  ],
  ignore: ["**/*.spec.ts"],
};
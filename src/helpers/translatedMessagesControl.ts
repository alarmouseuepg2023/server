import i18n from "i18n";

const getMessage = (key: string): string => i18n.__(key);

const getVariableMessage = (key: string, replace: any[]): string =>
  i18n.__mf(key, replace);

export { getMessage, getVariableMessage };

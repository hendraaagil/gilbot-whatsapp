export const toTitleCase = (str: string) =>
  str.replace(
    /\w\S*/g,
    (txt: string) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );

export const toLowerCase = (str: string) => str.toLowerCase();

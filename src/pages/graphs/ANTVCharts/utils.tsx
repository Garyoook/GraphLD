import { VisDataProps } from '@/pages/SparqlPage';

export function preprocessData(
  data: VisDataProps['data'],
): VisDataProps['data'] {
  return data.map((item) => {
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        const element = item[key] as number;

        // if is a number string, convert to number type.
        if (!isNaN(element)) {
          item[key] = Number(element);
        }

        // below code is used to remove LD PREFIX from the data
        if (
          typeof element == 'string' &&
          (element as string).match(
            /http:\/\/www\.semwebtech\.org\/mondial\/10\/(.*)/,
          )
        ) {
          const newValue = (element as string).split('/').reverse()[1];
          item[key] = newValue;
        }
      }
    }
    return item;
  });
}

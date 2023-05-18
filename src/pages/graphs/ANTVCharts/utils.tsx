import { VisDataProps } from '@/pages/SparqlPage';

export function preprocessDataForVisualisation(
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

export function safeGetFieldIndex(fieldsAll: string[], field: string): number {
  return fieldsAll.indexOf(field) == -1 ? 0 : fieldsAll.indexOf(field);
}

// safely get field from fieldsAll if not valid,
// return empty string for vis to render normally.
export function safeGetField(
  fieldsAll: string[],
  value: number,
  emptyHeader: string = '-',
): string {
  return fieldsAll[Number(value)] == emptyHeader
    ? ''
    : fieldsAll[Number(value)];
}

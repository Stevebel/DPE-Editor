export function snakeCaseToCamelCase(s: string) {
  return (
    s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase()
  ).replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}

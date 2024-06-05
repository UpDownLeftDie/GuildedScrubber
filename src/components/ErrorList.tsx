export interface ErrorListError {
  type: string;
  text: string;
}

const ErrorList = ({ errors }: { errors: ErrorListError[] }) => {
  const errorsList = errors.map((error) => {
    return <li key={error.type}>{error.text}</li>;
  });

  if (!errorsList?.length) return null;

  return (
    <div>
      Errors:
      <ul>{errorsList}</ul>
    </div>
  );
};

export default ErrorList;

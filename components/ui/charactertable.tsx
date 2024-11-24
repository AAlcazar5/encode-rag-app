type Character = {
  name: string;
  description: string;
  personality: string;
};

type CharacterTableProps = {
  characters: Character[];
};

export function CharacterTable({ characters }: CharacterTableProps) {
  return (
    <div className="text-overflow my-4 max-w-full">
      <table className="w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Personality
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-white">
          {characters.map((character, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap px-6 py-4">{character.name}</td>
              <td className="whitespace-nowrap px-6 py-4">
                {character.description}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {character.personality}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import Link from 'next/link';

export const metadata = {
  title: 'Guidelines | Contribo',
};

const GUIDELINES_CATEGORIES = [
  {
    title: 'Eligibility Rules',
    slug: 'eligibility',
    description: 'General guidelines on who can participate in various open source programs.',
  },
  {
    title: 'Proposal Writing',
    slug: 'proposal-writing',
    description: 'Tips and templates for crafting a winning project proposal.',
  },
  {
    title: 'Code of Conduct',
    slug: 'code-of-conduct',
    description: 'Community standards and expectations for all contributors.',
  },
  {
    title: 'Stipends & Payments',
    slug: 'stipends',
    description: 'How stipends work, tax implications, and typical payment schedules.',
  }
];

export default function GuidelinesHub() {
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Guidelines Hub</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Everything you need to know about navigating open source programs, writing proposals, and getting accepted.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {GUIDELINES_CATEGORIES.map((category) => (
          <Link href={`/guidelines/${category.slug}`} key={category.slug}>
            <div className="border border-gray-200 dark:border-gray-800 p-8 rounded-lg hover:shadow-md transition-shadow h-full bg-white dark:bg-gray-900">
              <h2 className="text-2xl font-semibold mb-3">{category.title}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
              <div className="mt-4 text-blue-500 font-medium group-hover:underline">
                Read guide &rarr;
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 border border-blue-100 dark:border-blue-800">
        <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">Need specific program rules?</h2>
        <p className="mb-6 text-blue-800 dark:text-blue-200">
          Every program has its own specific eligibility and timeline. Be sure to check the individual program pages for official rules.
        </p>
        <Link href="/programs" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Browse Programs
        </Link>
      </div>
    </main>
  );
}

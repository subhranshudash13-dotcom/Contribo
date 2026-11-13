export type GlossaryCategory = 'git' | 'github' | 'collaboration' | 'culture';

export interface GlossaryItem {
  term: string;
  category: GlossaryCategory;
  shortDef: string;
  inDepth: string;
  example: string;
  tips: string;
  aliases?: string[];
}

export const GLOSSARY_CATEGORIES: { id: GlossaryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'github', label: 'GitHub & Tools' },
  { id: 'git', label: 'Git & Terminal' },
  { id: 'collaboration', label: 'Collaboration' },
  { id: 'culture', label: 'Culture' },
];

export const GLOSSARY: GlossaryItem[] = [
  {
    term: 'PR',
    category: 'github',
    aliases: ['pull request'],
    shortDef: 'Pull Request: a proposal to merge your changes into a project.',
    inDepth: 'You push a branch to your fork and open a PR against the original repository. Maintainers review the diff, leave comments and merge it once it is approved.',
    example: 'feat(resources): add glossary. Closes #100',
    tips: 'Keep PRs small and link the issue they close so it is closed automatically on merge.',
  },
  {
    term: 'MR',
    category: 'github',
    aliases: ['merge request'],
    shortDef: "Merge Request: GitLab's name for a Pull Request.",
    inDepth: 'It works the same way as a PR. The only difference is the platform: GitLab says Merge Request, GitHub says Pull Request.',
    example: "Opening a Merge Request from your fork's branch on GitLab.",
    tips: 'If a project is hosted on GitLab, search its docs for "merge requests" instead of "pull requests".',
  },
  {
    term: 'Fork',
    category: 'github',
    shortDef: "Your own copy of someone else's repository on GitHub.",
    inDepth: 'Forking lets you experiment freely without write access to the original project. You then send your changes back through a pull request.',
    example: 'Click Fork on GitHub, then git clone your fork.',
    tips: 'Sync your fork with upstream before starting any new work.',
  },
  {
    term: 'Upstream',
    category: 'git',
    shortDef: 'The original repository your fork was created from.',
    inDepth: 'Contributors usually add it as a second remote named upstream so they can pull in the latest changes from the main project.',
    example: 'git remote add upstream https://github.com/owner/repo.git',
    tips: 'Run git fetch upstream before creating a branch so you start from the latest main.',
  },
  {
    term: 'Origin',
    category: 'git',
    shortDef: 'The default name Git gives to the remote you cloned from.',
    inDepth: 'If you cloned your fork, origin points to your fork, not to the original project. That is why the original is added separately as upstream.',
    example: 'git push origin my-branch',
    tips: 'Run git remote -v to see where origin and upstream point.',
  },
  {
    term: 'Rebase',
    category: 'git',
    shortDef: 'Re-apply your commits on top of a newer base branch.',
    inDepth: 'Rebasing rewrites your branch history so it looks like you started from the latest main. It gives a linear history but changes commit hashes, so avoid it on branches others share.',
    example: 'git fetch upstream && git rebase upstream/main',
    tips: 'After rebasing a branch you already pushed, use git push --force-with-lease.',
  },
  {
    term: 'Squash',
    category: 'git',
    aliases: ['squash and merge'],
    shortDef: 'Combine several commits into one.',
    inDepth: 'Maintainers often use "Squash and merge" so a messy series of fix-up commits becomes a single clean commit on main.',
    example: 'git rebase -i HEAD~3, then mark the later commits as squash.',
    tips: 'Do not worry about tidy commits while working. Many projects squash on merge anyway.',
  },
  {
    term: 'LGTM',
    category: 'culture',
    aliases: ['looks good to me'],
    shortDef: 'Looks Good To Me: a reviewer approves your change.',
    inDepth: 'It is shorthand left in review comments. Some projects expect it, or an approval, from a maintainer before merging.',
    example: 'LGTM, thanks for the quick fix!',
    tips: 'An LGTM is not always a merge. Wait for the maintainer to merge.',
  },
  {
    term: 'RFC',
    category: 'collaboration',
    aliases: ['request for comments'],
    shortDef: 'Request For Comments: a written proposal discussed before building a large change.',
    inDepth: 'Large features are often described in an RFC document or issue so the community can agree on the design before any code is written.',
    example: 'Opening an RFC issue describing a new plugin API.',
    tips: 'For big changes, start with an RFC or issue instead of a surprise PR.',
  },
  {
    term: 'Stalebot',
    category: 'github',
    aliases: ['stale bot', 'stale'],
    shortDef: 'A bot that labels and closes inactive issues and PRs.',
    inDepth: 'If nothing happens on an issue or PR for a set time, the bot adds a stale label and may close it later unless someone comments.',
    example: 'This issue has been marked stale because it has had no activity for 60 days.',
    tips: 'If you are still working on it, leave a short progress comment to keep it open.',
  },
  {
    term: 'SemVer',
    category: 'collaboration',
    aliases: ['semantic versioning'],
    shortDef: 'Semantic Versioning: versions written as MAJOR.MINOR.PATCH.',
    inDepth: 'MAJOR changes can break compatibility, MINOR adds features that stay compatible, PATCH only fixes bugs.',
    example: '2.4.1 to 2.5.0 adds a feature. 2.4.1 to 3.0.0 may break your code.',
    tips: 'Use the version number to judge how risky an upgrade is.',
  },
  {
    term: 'CLA',
    category: 'collaboration',
    aliases: ['contributor license agreement'],
    shortDef: 'Contributor License Agreement: a legal agreement you sign before contributing.',
    inDepth: 'Some projects require it so they have the right to distribute your contribution under the project license. A bot usually asks you to sign on your first PR.',
    example: 'The CLA bot comments on your first PR with a link to sign.',
    tips: 'If your employer owns your work, check with them before signing.',
  },
];

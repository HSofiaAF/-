export const getLikePeople = (memory, currentUser) => {
  const people = new Map();

  const remember = (person) => {
    if (person?.email) people.set(person.email.toLowerCase(), person.name || person.email);
  };

  remember(currentUser);
  remember(memory.author);
  memory.comments?.forEach((comment) => remember({
    email: comment.authorEmail,
    name: comment.authorName
  }));

  return (memory.likes || []).map((email) => ({
    email,
    name: people.get(email.toLowerCase()) || email.split('@')[0]
  }));
};
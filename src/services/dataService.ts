import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  comments: number;
  createdAt: Date;
}

const generateUser = (): User => {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
  };
};

const generatePost = (): Post => {
  const user = generateUser();
  const randomMediaType = faker.helpers.arrayElement(['image', 'video', undefined]);
  let mediaUrl = undefined;

  if (randomMediaType === 'image') {
    mediaUrl = faker.image.urlLoremFlickr({ category: 'nature' });
  } else if (randomMediaType === 'video') {
    mediaUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Replace with a real video URL if needed
  }

  return {
    id: faker.string.uuid(),
    user: user,
    content: faker.lorem.paragraph(),
    mediaUrl: mediaUrl,
    mediaType: randomMediaType,
    likes: faker.number.int({ min: 0, max: 500 }),
    comments: faker.number.int({ min: 0, max: 100 }),
    createdAt: faker.date.recent(),
  };
};

export const getPosts = (count: number = 10): Post[] => {
  const posts: Post[] = [];
  for (let i = 0; i < count; i++) {
    posts.push(generatePost());
  }
  return posts;
};

export const createPost = async (content: string, mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<Post> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = generateUser();

  return {
    id: faker.string.uuid(),
    user: user,
    content: content,
    mediaUrl: mediaUrl,
    mediaType: mediaType,
    likes: faker.number.int({ min: 0, max: 500 }),
    comments: faker.number.int({ min: 0, max: 100 }),
    createdAt: faker.date.recent(),
  };
};

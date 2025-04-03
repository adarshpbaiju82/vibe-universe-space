import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
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

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  likes: number;
  createdAt: Date;
  parentId?: string;
}

export interface UserSuggestion {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
}

export interface ExploreTopic {
  id: string;
  title: string;
  image: string;
  postCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  content: string;
  postId?: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage: string;
  updatedAt: Date;
  unreadCount: number;
}

// Generate a random user
const generateUser = (): User => {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    username: faker.internet.username(),
    avatar: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    followerCount: faker.number.int({ min: 0, max: 10000 }),
    followingCount: faker.number.int({ min: 0, max: 1000 }),
  };
};

// Generate a random post
const generatePost = (): Post => {
  const randomMediaType = faker.helpers.arrayElement(['image', 'video', undefined]) as 'image' | 'video' | undefined;
  let mediaUrl;
  
  if (randomMediaType === 'image') {
    mediaUrl = faker.image.urlLoremFlickr({ category: 'nature' });
  } else if (randomMediaType === 'video') {
    mediaUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
  }
  
  return {
    id: faker.string.uuid(),
    user: generateUser(),
    content: faker.lorem.paragraph(),
    mediaUrl,
    mediaType: randomMediaType,
    likes: faker.number.int({ min: 0, max: 500 }),
    comments: faker.number.int({ min: 0, max: 100 }),
    createdAt: faker.date.recent(),
  };
};

// Get posts
export const getPosts = (count: number = 10): Post[] => {
  const posts: Post[] = [];
  for (let i = 0; i < count; i++) {
    posts.push(generatePost());
  }
  return posts;
};

// Get user posts
export const getUserPosts = (userId: string, count: number = 10): Post[] => {
  const posts: Post[] = [];
  for (let i = 0; i < count; i++) {
    const post = generatePost();
    post.user.id = userId;
    posts.push(post);
  }
  return posts;
};

// Get user media posts (only posts with media)
export const getUserMedia = async (userId: string): Promise<Post[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Generate random posts with media
  const mediaCount = faker.number.int({ min: 5, max: 12 });
  const mediaPosts: Post[] = [];
  
  for (let i = 0; i < mediaCount; i++) {
    const mediaType = faker.helpers.arrayElement(['image', 'video']) as 'image' | 'video';
    const post = {
      id: faker.string.uuid(),
      user: {
        id: userId,
        name: faker.person.fullName(),
        username: faker.internet.userName(),
        avatar: faker.image.avatar(),
      },
      content: faker.lorem.sentence(),
      mediaUrl: mediaType === 'image' 
        ? faker.image.urlLoremFlickr({ category: faker.helpers.arrayElement(['nature', 'people', 'city']) }) 
        : 'https://www.w3schools.com/html/mov_bbb.mp4',
      mediaType,
      likes: faker.number.int({ min: 0, max: 500 }),
      comments: faker.number.int({ min: 0, max: 100 }),
      createdAt: faker.date.recent(),
    };
    mediaPosts.push(post);
  }
  
  return mediaPosts;
};

// Get user likes
export const getUserLikes = async (userId: string): Promise<Post[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Generate random liked posts
  const likeCount = faker.number.int({ min: 3, max: 8 });
  const likedPosts: Post[] = [];
  
  for (let i = 0; i < likeCount; i++) {
    const post = generatePost();
    // Make sure these posts are liked
    post.likes = faker.number.int({ min: 1, max: 500 });
    likedPosts.push(post);
  }
  
  return likedPosts;
};

// Create post
export const createPost = async (
  content: string, 
  mediaUrl?: string, 
  mediaType?: 'image' | 'video'
): Promise<Post> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    id: faker.string.uuid(),
    user: generateUser(),
    content,
    mediaUrl,
    mediaType,
    likes: 0,
    comments: 0,
    createdAt: new Date(),
  };
};

// Toggle like on a post
export const toggleLike = async (postId: string): Promise<Post> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // In a real app, this would make a call to update the like status
  const post = generatePost();
  post.id = postId;
  post.likes = post.likes > 0 ? post.likes - 1 : post.likes + 1;
  
  return post;
};

// Get comments for a post
export const getComments = async (postId: string): Promise<Comment[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Generate random comments
  const commentCount = faker.number.int({ min: 0, max: 5 });
  const comments: Comment[] = [];
  
  for (let i = 0; i < commentCount; i++) {
    comments.push({
      id: faker.string.uuid(),
      postId,
      userId: faker.string.uuid(),
      username: faker.internet.username(),
      userAvatar: faker.image.avatar(),
      content: faker.lorem.sentence(),
      likes: faker.number.int({ min: 0, max: 50 }),
      createdAt: faker.date.recent(),
    });
  }
  
  return comments;
};

// Add a comment to a post
export const addComment = async (
  postId: string,
  userId: string,
  username: string,
  userAvatar: string,
  content: string
): Promise<Comment> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    id: faker.string.uuid(),
    postId,
    userId,
    username,
    userAvatar,
    content,
    likes: 0,
    createdAt: new Date(),
  };
};

// Get user suggestions
export const getUserSuggestions = async (): Promise<UserSuggestion[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Generate random user suggestions
  const suggestionCount = faker.number.int({ min: 3, max: 6 });
  const suggestions: UserSuggestion[] = [];
  
  for (let i = 0; i < suggestionCount; i++) {
    suggestions.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      username: faker.internet.username(),
      avatar: faker.image.avatar(),
      bio: faker.lorem.sentence(),
      isFollowing: Math.random() > 0.7,
    });
  }
  
  return suggestions;
};

// Toggle follow status
export const toggleFollow = async (userId: string): Promise<{ success: boolean }> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // In a real app, this would make a call to update the follow status
  return { success: true };
};

// Get explore topics
export const getExploreTopics = async (): Promise<ExploreTopic[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Generate random explore topics
  const topicCount = faker.number.int({ min: 4, max: 8 });
  const topics: ExploreTopic[] = [];
  
  for (let i = 0; i < topicCount; i++) {
    topics.push({
      id: faker.string.uuid(),
      title: faker.lorem.words({ min: 1, max: 3 }).charAt(0).toUpperCase() + faker.lorem.words({ min: 1, max: 3 }).slice(1),
      image: faker.image.urlLoremFlickr({ category: faker.helpers.arrayElement(['nature', 'city', 'people', 'technology']) }),
      postCount: faker.number.int({ min: 100, max: 10000 }),
    });
  }
  
  return topics;
};

// Get notifications
export const getNotifications = async (): Promise<Notification[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Generate random notifications
  const notificationCount = faker.number.int({ min: 5, max: 10 });
  const notifications: Notification[] = [];
  
  const notificationTypes: Notification['type'][] = ['like', 'comment', 'follow', 'mention'];
  const contentByType = {
    like: 'liked your post',
    comment: 'commented on your post',
    follow: 'started following you',
    mention: 'mentioned you in a post',
  };
  
  for (let i = 0; i < notificationCount; i++) {
    const type = faker.helpers.arrayElement(notificationTypes);
    const hasPostId = type !== 'follow';
    
    notifications.push({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      username: faker.internet.username(),
      userAvatar: faker.image.avatar(),
      type,
      content: contentByType[type],
      postId: hasPostId ? faker.string.uuid() : undefined,
      createdAt: faker.date.recent(),
      isRead: Math.random() > 0.5,
    });
  }
  
  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  data: Partial<User>
): Promise<User> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // In a real app, this would update the user profile in the database
  return {
    id: userId,
    name: data.name || faker.person.fullName(),
    username: data.username || faker.internet.username(),
    avatar: data.avatar || faker.image.avatar(),
    bio: data.bio,
    followerCount: faker.number.int({ min: 0, max: 10000 }),
    followingCount: faker.number.int({ min: 0, max: 1000 }),
  };
};

// Get user chats
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  // Generate random chats
  const chatCount = faker.number.int({ min: 3, max: 8 });
  const chats: Chat[] = [];
  
  for (let i = 0; i < chatCount; i++) {
    chats.push({
      id: faker.string.uuid(),
      participants: [
        { 
          id: userId, 
          name: 'You', 
          username: 'you', 
          avatar: faker.image.avatar() 
        },
        generateUser()
      ],
      lastMessage: faker.lorem.sentence(),
      updatedAt: faker.date.recent(),
      unreadCount: faker.helpers.rangeToNumber({ min: 0, max: 5 }),
    });
  }
  
  return chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

// Get messages for a chat
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Generate random messages
  const messageCount = faker.number.int({ min: 5, max: 20 });
  const messages: Message[] = [];
  
  for (let i = 0; i < messageCount; i++) {
    messages.push({
      id: faker.string.uuid(),
      senderId: faker.helpers.arrayElement([
        faker.string.uuid(), // random user
        'currentUser' // current user
      ]),
      receiverId: faker.string.uuid(),
      content: faker.lorem.sentences({ min: 1, max: 3 }),
      createdAt: faker.date.recent(),
      isRead: true,
    });
  }
  
  return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

// Send message
export const sendMessage = async (chatId: string, content: string): Promise<Message> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    id: faker.string.uuid(),
    senderId: 'currentUser',
    receiverId: faker.string.uuid(),
    content,
    createdAt: new Date(),
    isRead: false,
  };
};

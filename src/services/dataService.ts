// Mock data for our social media app

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: Date;
  isLiked?: boolean;
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

// Mock posts data
const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    userId: "1",
    username: "cosmicvibe",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    content: "Just discovered a new dimension of creativity today! #VibeUniverse",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop",
    likes: 52,
    comments: 7,
    createdAt: new Date(Date.now() - 3600000),
    isLiked: false
  },
  {
    id: "p2",
    userId: "2",
    username: "stardust",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    content: "Exploring the cosmic energies today. The universe is full of surprises! ✨🌌",
    likes: 103,
    comments: 12,
    createdAt: new Date(Date.now() - 7200000),
    isLiked: true
  },
  {
    id: "p3",
    userId: "3",
    username: "nebulasurfer",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    content: "Just finished my latest digital art piece inspired by the cosmos.",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop",
    likes: 87,
    comments: 9,
    createdAt: new Date(Date.now() - 10800000),
    isLiked: false
  },
  {
    id: "p4",
    userId: "4",
    username: "quantumleap",
    userAvatar: "https://i.pravatar.cc/150?img=4",
    content: "Physics teaches us that everything is connected. Your thoughts create your reality!",
    likes: 42,
    comments: 5,
    createdAt: new Date(Date.now() - 18000000),
    isLiked: false
  },
  {
    id: "p5",
    userId: "5",
    username: "galaxyglider",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    content: "Today's sunset was absolutely magical. Nature's light show at its best!",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&auto=format&fit=crop",
    likes: 127,
    comments: 14,
    createdAt: new Date(Date.now() - 86400000),
    isLiked: true
  }
];

// Mock comments data
const MOCK_COMMENTS: Record<string, Comment[]> = {
  "p1": [
    {
      id: "c1",
      postId: "p1",
      userId: "2",
      username: "stardust",
      userAvatar: "https://i.pravatar.cc/150?img=2",
      content: "Amazing! What inspired this?",
      likes: 3,
      createdAt: new Date(Date.now() - 3000000)
    },
    {
      id: "c2",
      postId: "p1",
      userId: "3",
      username: "nebulasurfer",
      userAvatar: "https://i.pravatar.cc/150?img=3",
      content: "Love the vibrant energy!",
      likes: 2,
      createdAt: new Date(Date.now() - 2500000)
    },
    {
      id: "c3",
      postId: "p1",
      userId: "4",
      username: "quantumleap",
      userAvatar: "https://i.pravatar.cc/150?img=4",
      content: "This is a reply to the first comment",
      likes: 1,
      createdAt: new Date(Date.now() - 2000000),
      parentId: "c1"
    }
  ],
  "p2": [
    {
      id: "c4",
      postId: "p2",
      userId: "1",
      username: "cosmicvibe",
      userAvatar: "https://i.pravatar.cc/150?img=1",
      content: "The universe always delivers! 🌟",
      likes: 5,
      createdAt: new Date(Date.now() - 6500000)
    }
  ]
};

// Helper function to simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all posts
export const getPosts = async (): Promise<Post[]> => {
  await delay(800);
  return [...MOCK_POSTS];
};

// Get posts for a specific user
export const getUserPosts = async (userId: string): Promise<Post[]> => {
  await delay(800);
  return MOCK_POSTS.filter(post => post.userId === userId);
};

// Create a new post
export const createPost = async (userId: string, username: string, userAvatar: string, content: string, image?: string): Promise<Post> => {
  await delay(800);
  const newPost: Post = {
    id: `p${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username,
    userAvatar,
    content,
    image,
    likes: 0,
    comments: 0,
    createdAt: new Date(),
    isLiked: false
  };
  
  // In a real app, we'd save this to the database
  MOCK_POSTS.unshift(newPost);
  
  return newPost;
};

// Toggle like on a post
export const toggleLike = async (postId: string): Promise<Post> => {
  await delay(500);
  const postIndex = MOCK_POSTS.findIndex(p => p.id === postId);
  
  if (postIndex === -1) {
    throw new Error("Post not found");
  }
  
  const post = MOCK_POSTS[postIndex];
  const updatedPost = {
    ...post,
    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
    isLiked: !post.isLiked
  };
  
  MOCK_POSTS[postIndex] = updatedPost;
  return updatedPost;
};

// Get comments for a post
export const getComments = async (postId: string): Promise<Comment[]> => {
  await delay(800);
  return MOCK_COMMENTS[postId] || [];
};

// Add a comment to a post
export const addComment = async (
  postId: string,
  userId: string,
  username: string,
  userAvatar: string,
  content: string,
  parentId?: string
): Promise<Comment> => {
  await delay(800);
  
  const newComment: Comment = {
    id: `c${Math.random().toString(36).substr(2, 9)}`,
    postId,
    userId,
    username,
    userAvatar,
    content,
    likes: 0,
    createdAt: new Date(),
    parentId
  };
  
  // Initialize comments array for this post if it doesn't exist
  if (!MOCK_COMMENTS[postId]) {
    MOCK_COMMENTS[postId] = [];
  }
  
  MOCK_COMMENTS[postId].push(newComment);
  
  // Update comment count on the post
  const postIndex = MOCK_POSTS.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    MOCK_POSTS[postIndex].comments += 1;
  }
  
  return newComment;
};

// Edit a comment
export const editComment = async (commentId: string, content: string): Promise<Comment> => {
  await delay(500);
  
  // Find the comment in all posts
  let updatedComment: Comment | null = null;
  
  Object.keys(MOCK_COMMENTS).forEach(postId => {
    const commentIndex = MOCK_COMMENTS[postId].findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      MOCK_COMMENTS[postId][commentIndex] = {
        ...MOCK_COMMENTS[postId][commentIndex],
        content
      };
      updatedComment = MOCK_COMMENTS[postId][commentIndex];
    }
  });
  
  if (!updatedComment) {
    throw new Error("Comment not found");
  }
  
  return updatedComment;
};

// Explore suggestion data
export interface ExploreTopic {
  id: string;
  title: string;
  image: string;
  postCount: number;
}

export const getExploreTopics = async (): Promise<ExploreTopic[]> => {
  await delay(800);
  return [
    {
      id: "t1",
      title: "Digital Art",
      image: "https://images.unsplash.com/photo-1633186710895-309db2adfd20?w=800&auto=format&fit=crop",
      postCount: 3456
    },
    {
      id: "t2",
      title: "Nature",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop",
      postCount: 7890
    },
    {
      id: "t3",
      title: "Technology",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
      postCount: 5432
    },
    {
      id: "t4",
      title: "Space",
      image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop",
      postCount: 2341
    }
  ];
};

// User suggestions for "Who to follow"
export interface UserSuggestion {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
}

export const getUserSuggestions = async (): Promise<UserSuggestion[]> => {
  await delay(800);
  return [
    {
      id: "3",
      username: "nebulasurfer",
      name: "Nebula Surfer",
      avatar: "https://i.pravatar.cc/150?img=3",
      bio: "Digital artist exploring cosmic themes",
      isFollowing: false
    },
    {
      id: "4",
      username: "quantumleap",
      name: "Quantum Leap",
      avatar: "https://i.pravatar.cc/150?img=4",
      bio: "Physics enthusiast and deep thinker",
      isFollowing: false
    },
    {
      id: "5",
      username: "galaxyglider",
      name: "Galaxy Glider",
      avatar: "https://i.pravatar.cc/150?img=5",
      bio: "Photographer capturing the beauty of our universe",
      isFollowing: true
    }
  ];
};

export const toggleFollow = async (userId: string): Promise<{ success: boolean }> => {
  await delay(500);
  return { success: true };
};

// Notifications data
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  postId?: string;
  createdAt: Date;
  isRead: boolean;
}

export const getNotifications = async (): Promise<Notification[]> => {
  await delay(800);
  return [
    {
      id: "n1",
      type: "like",
      userId: "2",
      username: "stardust",
      userAvatar: "https://i.pravatar.cc/150?img=2",
      content: "liked your post",
      postId: "p1",
      createdAt: new Date(Date.now() - 3600000),
      isRead: false
    },
    {
      id: "n2",
      type: "comment",
      userId: "3",
      username: "nebulasurfer",
      userAvatar: "https://i.pravatar.cc/150?img=3",
      content: "commented on your post: \"Great content!\"",
      postId: "p1",
      createdAt: new Date(Date.now() - 7200000),
      isRead: true
    },
    {
      id: "n3",
      type: "follow",
      userId: "4",
      username: "quantumleap",
      userAvatar: "https://i.pravatar.cc/150?img=4",
      content: "started following you",
      createdAt: new Date(Date.now() - 86400000),
      isRead: false
    },
    {
      id: "n4",
      type: "mention",
      userId: "5",
      username: "galaxyglider",
      userAvatar: "https://i.pravatar.cc/150?img=5",
      content: "mentioned you in a comment: \"@cosmicvibe check this out!\"",
      postId: "p5",
      createdAt: new Date(Date.now() - 172800000),
      isRead: true
    }
  ];
};

// Profile editing functionality
export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: string;
}

export const updateUserProfile = async (userId: string, data: UpdateProfileData): Promise<boolean> => {
  await delay(800);
  // In a real app, we would update the user profile in the database
  return true;
};

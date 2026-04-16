import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  profilePhoto?: string;
  createdAt: Timestamp;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface Post {
  id: string;
  userId: string;
  authorUsername: string;
  authorPhoto?: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  location?: string;
  hashtags?: string[];
  createdAt: Timestamp;
  likesCount: number;
  commentsCount: number;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userPhoto?: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantUsernames: string[];
  participantPhotos: string[];
  lastMessage?: string;
  lastUpdatedAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  fromUserId: string;
  fromUsername: string;
  fromUserPhoto?: string;
  type: 'like' | 'comment' | 'follow';
  postId?: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userPhoto?: string;
  text: string;
  createdAt: Timestamp;
}

export interface Like {
  userId: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Timestamp;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    tenantId: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

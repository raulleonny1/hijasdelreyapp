export type PrayerRequest = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  /** Only true if the author consented to share with others */
  shareWithOthers: boolean;
  createdAt: string;
};

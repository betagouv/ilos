export type QueueTargetType = string;

export type QueueConfigType = {
  driver: string;
  for: QueueTargetType[];
};

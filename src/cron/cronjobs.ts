
export const cronJobs = async () => {
  // only init if not in development mode
  if (process.env.NODE_ENV === 'development') {
    console.warn('[CronJobs] Skipping cron job initialization in development mode');
    return;
  }
  console.info('[CronJobs] Initializing cron jobs...');
  console.info('[CronJobs] All cron jobs initialized successfully');
};

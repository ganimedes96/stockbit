export const remainingTrialDays = (date:Date) => {
    const trialDuration = 30 * 24 * 60 * 60 * 1000;
    const createdAt = date
      ? new Date(date).getTime()
      : null;
    const now = Date.now();

    const remainingDays = createdAt
      ? Math.max(
          0,
          Math.ceil((createdAt + trialDuration - now) / (1000 * 60 * 60 * 24))
        )
      : 0;

    return remainingDays;
}
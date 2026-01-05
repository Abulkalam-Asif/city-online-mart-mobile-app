export const productUtils = {
  isMarkAsNewValid(
    markAsNewStartDate?: Date,
    markAsNewEndDate?: Date
  ): boolean {
    const now = new Date();
    if (!markAsNewStartDate || !markAsNewEndDate) return false;
    return now >= markAsNewStartDate && now <= markAsNewEndDate;
  },
};
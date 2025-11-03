import { useMemo } from 'react';
import { getTodaySessions, getTodayStats, getHourlyUsage, groupOverlappingSessions } from '../utils/sessionUtils';

/**
 * 통계 계산을 위한 커스텀 훅
 */
export const useStatistics = (sessions, selectedTags, extractTagsFn, startHour = 0, endHour = 23) => {
  const todaySessions = useMemo(() => {
    return getTodaySessions(sessions, selectedTags, extractTagsFn);
  }, [sessions, selectedTags, extractTagsFn]);

  const stats = useMemo(() => {
    return getTodayStats(sessions, selectedTags, extractTagsFn);
  }, [sessions, selectedTags, extractTagsFn]);

  const hourlyUsage = useMemo(() => {
    return getHourlyUsage(todaySessions, startHour, endHour);
  }, [todaySessions, startHour, endHour]);

  const groupedSessions = useMemo(() => {
    return groupOverlappingSessions(todaySessions);
  }, [todaySessions]);

  return {
    todaySessions,
    stats,
    hourlyUsage,
    groupedSessions
  };
};


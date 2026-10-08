import { useState, useEffect } from 'react';

export const useSessionNotifications = (user) => {
  const [sessionNotifications, setSessionNotifications] = useState([]);

  // Get enrolled courses for current user
  const getUserEnrolledCourses = (userEmail) => {
    const allCourses = JSON.parse(localStorage.getItem("studyconnect_courses") || "[]");
    return allCourses.filter(course => 
      course.enrolledStudents && course.enrolledStudents.includes(userEmail)
    );
  };

  // Check if user is enrolled in the same course as the session
  const shouldReceiveNotification = (session, userEmail) => {
    console.log(`🔍 Checking notification eligibility for user: ${userEmail}`);
    console.log(`🔍 Session details:`, {
      createdBy: session.createdBy,
      courseId: session.courseId,
      title: session.title
    });

    // Always notify session creator
    if (session.createdBy === userEmail || session.createdBy === user?.name || session.createdBy === "User" || session.createdBy === "Anonymous") {
      console.log(`✅ User ${userEmail} is session creator - should receive notification`);
      return true;
    }

    // Check if session is associated with a course
    if (session.courseId) {
      const allCourses = JSON.parse(localStorage.getItem("studyconnect_courses") || "[]");
      const course = allCourses.find(c => c.id === session.courseId);
      
      console.log(`🔍 Course found:`, course);
      
      if (course && course.enrolledStudents) {
        const isEnrolled = course.enrolledStudents.includes(userEmail);
        console.log(`🔍 User ${userEmail} enrolled in course: ${isEnrolled}`);
        if (isEnrolled) {
          console.log(`✅ User ${userEmail} is enrolled in course - should receive notification`);
          return true;
        }
      }
    }

    // Check if user is enrolled in any course and session is for that course
    const userCourses = getUserEnrolledCourses(userEmail);
    console.log(`🔍 User ${userEmail} enrolled courses:`, userCourses);
    const isInCourse = userCourses.some(course => course.id === session.courseId);
    console.log(`🔍 User ${userEmail} in session course: ${isInCourse}`);
    
    if (isInCourse) {
      console.log(`✅ User ${userEmail} is in course - should receive notification`);
      return true;
    }

    console.log(`❌ User ${userEmail} should not receive notification`);
    return false;
  };

  // Get all users who should receive notifications for a session
  const getNotificationRecipients = (session) => {
    const allUsers = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const recipients = [];

    console.log(`🔍 Finding notification recipients for session: ${session.title}`);
    console.log(`🔍 Total users in system: ${allUsers.length}`);

    allUsers.forEach(user => {
      if (shouldReceiveNotification(session, user.email)) {
        recipients.push(user.email);
        console.log(`✅ Added recipient: ${user.email}`);
      } else {
        console.log(`❌ Skipped user: ${user.email}`);
      }
    });

    console.log(`🔍 Final recipients list:`, recipients);
    return recipients;
  };

  // Convert UTC time to Indian Standard Time (IST = UTC+5:30)
  const convertToIST = (date) => {
    // Create a new Date object with IST timezone
    const istDate = new Date(date);
    return istDate;
  };

  // Convert 24-hour time to 12-hour format with AM/PM
  const convertTo12HourFormat = (time24) => {
    if (!time24) return '12:00 PM';
    
    // Handle different time formats
    let hours, minutes;
    
    if (time24.includes(':')) {
      [hours, minutes] = time24.split(':').map(Number);
    } else {
      // If time is in format like "2100" or "21"
      if (time24.length === 4) {
        hours = parseInt(time24.substring(0, 2));
        minutes = parseInt(time24.substring(2, 4));
      } else if (time24.length === 3) {
        hours = parseInt(time24.substring(0, 1));
        minutes = parseInt(time24.substring(1, 3));
      } else {
        hours = parseInt(time24);
        minutes = 0;
      }
    }
    
    if (isNaN(hours) || isNaN(minutes)) return '12:00 PM';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  };
  const getNotificationFlags = (sessionId) => {
    const flags = JSON.parse(localStorage.getItem("session_notification_flags") || "{}");
    return flags[sessionId] || {
      dayBefore: false,
      hourBefore: false,
      twoMinBefore: false,
      oneMinBefore: false
    };
  };

  // Set notification flag for a session
  const setNotificationFlag = (sessionId, flag) => {
    const flags = JSON.parse(localStorage.getItem("session_notification_flags") || "{}");
    flags[sessionId] = {
      ...getNotificationFlags(sessionId),
      [flag]: true
    };
    localStorage.setItem("session_notification_flags", JSON.stringify(flags));
  };

  // Check if a notification already exists for a specific session and condition
  const notificationExists = (sessionId, condition) => {
    const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    return allNotifications.some(n => 
      n.type === 'session_reminder' && 
      n.session_id === sessionId && 
      n.condition === condition
    );
  };

  // Create a session reminder notification for all relevant users
  const createSessionNotification = (session, condition, timeMessage) => {
    const formattedTime = convertTo12HourFormat(session.time);
    
    // Use session time in message instead of countdown
    let message;
    if (condition === '1_minute_before') {
      message = `Session starts today at ${formattedTime}`;
    } else if (condition === '2_minutes_before') {
      message = `Session starts today at ${formattedTime}`;
    } else if (condition === '1_hour_before') {
      message = `Session starts today at ${formattedTime}`;
    } else if (condition === '1_day_before') {
      message = `Session starts today at ${formattedTime}`;
    } else if (condition === 'session_started') {
      message = `Session starts today at ${formattedTime}`;
    } else {
      message = `${timeMessage}: "${session.title}" at ${formattedTime}`;
    }
    
    // Get all users who should receive this notification
    const recipients = getNotificationRecipients(session);
    
    // Create notifications for each recipient
    const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    
    recipients.forEach(recipientEmail => {
      // Check if notification already exists for this recipient
      const existingNotification = allNotifications.find(n => 
        n.type === 'session_reminder' && 
        n.session_id === session.id && 
        n.condition === condition &&
        n.recipient_email === recipientEmail
      );
      
      if (!existingNotification) {
        const notification = {
          id: `session_${session.id}_${condition}_${recipientEmail}_${Date.now()}`,
          type: 'session_reminder',
          sender_email: 'system',
          recipient_email: recipientEmail,
          session_id: session.id,
          session_title: session.title,
          session_date: session.date,
          session_time: session.time,
          condition: condition,
          message: message,
          created_at: new Date().toISOString(),
          read: false
        };
        
        allNotifications.push(notification);
        
        console.log('🔔 Session notification created for:', {
          recipient: recipientEmail,
          session: session.title,
          condition: condition,
          message: message,
          time: new Date().toLocaleString()
        });
      }
    });
    
    // Save all notifications
    localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));
    
    return recipients.length;
  };

  // Check session reminders and create notifications
  const checkSessionReminders = () => {
    if (!user) return;

    // Get all sessions from localStorage
    const allSessions = JSON.parse(localStorage.getItem("study_sessions") || "[]");
    
    // Filter sessions that are relevant to current user
    const userSessions = allSessions.filter(session => 
      session.createdBy === user.name || 
      session.createdBy === user.email || 
      session.createdBy === "User" || 
      session.createdBy === "Anonymous"
    );

    const now = new Date();
    
    console.log('🔍 Checking session reminders for', userSessions.length, 'sessions at', now.toLocaleString());
    console.log('🔍 Current user:', user.email, user.name);

    userSessions.forEach(session => {
      try {
        // Parse session date and time - handle different date formats
        let sessionDateTime;
        
        if (session.date.includes('T')) {
          // If date already includes time
          sessionDateTime = new Date(session.date);
        } else {
          // If date is separate from time
          sessionDateTime = new Date(`${session.date}T${session.time || '00:00'}`);
        }

        // Skip recently created sessions (within 30 seconds) to prevent immediate notifications
        const sessionCreatedAt = new Date(session.createdAt || session.created_at || now);
        const timeSinceCreation = now.getTime() - sessionCreatedAt.getTime();
        const recentlyCreated = timeSinceCreation < (30 * 1000); // Created within last 30 seconds

        if (recentlyCreated) {
          console.log(`⏸ Session "${session.title}" was just created, skipping immediate check`);
          return;
        }

        console.log(`📅 Session "${session.title}":`, {
          scheduled: sessionDateTime.toLocaleString(),
          now: now.toLocaleString(),
          sessionDate: session.date,
          sessionTime: session.time,
          createdBy: session.createdBy,
          courseId: session.courseId
        });
        
        // Skip if session is in the past (more than 1 hour ago)
        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
        if (sessionDateTime < oneHourAgo) {
          console.log(`⏭ Session "${session.title}" is in the past, skipping`);
          return;
        }

        // Calculate time differences in milliseconds
        const timeDiff = sessionDateTime.getTime() - now.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        // Get existing flags for this session
        const flags = getNotificationFlags(session.id);

        console.log(`⏰ Session "${session.title}" time analysis:`, {
          timeDiff: timeDiff,
          minutesUntil: minutesDiff,
          hoursUntil: hoursDiff,
          daysUntil: daysDiff,
          flags: flags
        });

        // Check for 1 day before (24 hours or less, but more than 1 hour)
        if (daysDiff >= 1 && hoursDiff < 24 && !flags.dayBefore) {
          console.log('🔔 Creating 1 day before notification for:', session.title);
          const recipients = createSessionNotification(session, '1_day_before', 'Session starts in 1 day');
          console.log(`🔔 1 day notification sent to ${recipients} recipients`);
          setNotificationFlag(session.id, 'dayBefore');
        }

        // Check for 1 hour before (60 minutes or less, but more than 2 minutes)
        if (hoursDiff >= 1 && minutesDiff < 60 && !flags.hourBefore) {
          console.log('🔔 Creating 1 hour before notification for:', session.title);
          const recipients = createSessionNotification(session, '1_hour_before', 'Session starts in 1 hour');
          console.log(`🔔 1 hour notification sent to ${recipients} recipients`);
          setNotificationFlag(session.id, 'hourBefore');
        }

        // Check for 2 minutes before (exactly 2 minutes)
        if (minutesDiff === 2 && !flags.twoMinBefore) {
          console.log('🔔 Creating 2 minutes before notification for:', session.title);
          const recipients = createSessionNotification(session, '2_minutes_before', 'Session starts in 2 minutes');
          console.log(`🔔 2 minutes notification sent to ${recipients} recipients`);
          setNotificationFlag(session.id, 'twoMinBefore');
        }

        // Check for 1 minute before (exactly 1 minute)
        if (minutesDiff === 1 && !flags.oneMinBefore) {
          console.log('🔔 Creating 1 minute before notification for:', session.title);
          const recipients = createSessionNotification(session, '1_minute_before', 'Session starts in 1 minute');
          console.log(`🔔 1 minute notification sent to ${recipients} recipients`);
          setNotificationFlag(session.id, 'oneMinBefore');
        }

        // If current time is exactly at session start time, trigger immediate notification
        if (minutesDiff <= 0 && minutesDiff > -5 && !flags.sessionStarted) {
          console.log('🎯 Session starting now notification for:', session.title);
          const recipients = createSessionNotification(session, 'session_started', 'Session is starting now!');
          console.log(`🔔 Session started notification sent to ${recipients} recipients`);
          setNotificationFlag(session.id, 'sessionStarted');
        }

      } catch (error) {
        console.error('❌ Error processing session reminder for session:', session.title, error);
      }
    });
  };

  // Clean up old session notifications (older than 7 days)
  const cleanupOldNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const filtered = allNotifications.filter(n => {
      if (n.type === 'session_reminder' || n.type === 'session_started') {
        // Remove session reminders that are older than 7 days
        const notificationDate = new Date(n.created_at);
        if (notificationDate < sevenDaysAgo) return false;
        
        // Remove notifications for sessions that have already passed (more than 2 hours ago)
        if (n.session_date && n.session_time) {
          try {
            let sessionDateTime;
            if (n.session_date.includes('T')) {
              sessionDateTime = new Date(n.session_date);
            } else {
              sessionDateTime = new Date(`${n.session_date}T${n.session_time}`);
            }
            
            const now = new Date();
            const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
            
            if (sessionDateTime < twoHoursAgo) return false;
          } catch (error) {
            // If we can't parse session time, keep notification
          }
        }
      }
      return true;
    });

    localStorage.setItem("studyconnect_notifications", JSON.stringify(filtered));
  };

  // Initialize notification flags for user's sessions
  const initializeNotificationFlags = () => {
    if (!user) return;
    
    const allSessions = JSON.parse(localStorage.getItem("study_sessions") || "[]");
    const userSessions = allSessions.filter(session => 
      session.createdBy === user.name || 
      session.createdBy === user.email || 
      session.createdBy === "User" || 
      session.createdBy === "Anonymous"
    );

    // Clean up flags for sessions that no longer exist
    const flags = JSON.parse(localStorage.getItem("session_notification_flags") || "{}");
    const validSessionIds = userSessions.map(s => s.id);
    const cleanedFlags = {};
    
    Object.keys(flags).forEach(sessionId => {
      if (validSessionIds.includes(sessionId)) {
        cleanedFlags[sessionId] = flags[sessionId];
      }
    });
    
    localStorage.setItem("session_notification_flags", JSON.stringify(cleanedFlags));
  };

  // Set up interval to check reminders every 30 seconds for reliable timing
  useEffect(() => {
    if (!user) return;

    // Initialize notification flags
    initializeNotificationFlags();

    // Initial check
    console.log('🚀 Initial session reminder check for user:', user.email);
    checkSessionReminders();
    cleanupOldNotifications();

    // Check every 30 seconds for reliable timing
    const interval = setInterval(() => {
      checkSessionReminders();
      cleanupOldNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return {
    sessionNotifications,
    checkSessionReminders,
    cleanupOldNotifications,
    convertToIST
  };
};

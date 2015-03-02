# These views are setup on the mofointegration database
# This app does not have access to the full mofointegration database, just these views
# A consistent secret needs to be used to create the views but should not be committed to this repo

# this first view is needed, but not exposed directly to the app
CREATE VIEW `vw_wm_INTERNAL_makes` AS
  SELECT 'butter' AS `src`,
         `bu_Projects`.`email` AS `email`,
         `bu_Projects`.`createdAt` AS `createdAt`
  FROM `bu_Projects`
  UNION ALL
  SELECT 'thimble' AS `src`,
         `th_ThimbleProjects`.`userid` AS `email`,
         `th_ThimbleProjects`.`createdAt` AS `createdAt`
  FROM `th_ThimbleProjects`
  UNION ALL
  SELECT 'goggles' AS `src`,
         `gg_ThimbleProjects`.`userid` AS `email`,
         `gg_ThimbleProjects`.`createdAt` AS `createdAt`
  FROM `gg_ThimbleProjects`
  UNION ALL
    (SELECT 'appmaker' AS `src`,
            `usr`.`email` AS `email`,
            `app`.`createdAt` AS `createdAt`
     FROM (`appmaker_temp` `app`
           LEFT JOIN `wl_Users` `usr` on((`usr`.`username` = convert(`app`.`username` USING utf8))) ) );


CREATE VIEW `vw_wm_metrics_badges` AS
  SELECT `badges`.`logged_by` AS `logged_by`,
         sha(concat(`badges`.`contributor_id`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`,
         `badges`.`contribution_date` AS `badgedOn`,
         `badges`.`description` AS `badgeName`,
         `usr`.`id` AS `userId`,
         `usr`.`lastLoggedIn` AS `lastLoggedIn`
  FROM (`ah_contributions` `badges`
        LEFT JOIN `wl_Users` `usr` on((`usr`.`email` = `badges`.`contributor_id`)))
  WHERE (`badges`.`logged_by` = 'badgekit-api');


CREATE VIEW `vw_wm_metrics_event_host_ids` AS
    (SELECT `usr`.`id` AS `userId`,
            `ev`.`beginDate` AS `eventDate`,
            'host' AS `hostType`
     FROM (`ev_Events` `ev`
           LEFT JOIN `wl_Users` `usr` on((`ev`.`organizer` = `usr`.`email`))))
  UNION ALL
    (SELECT `men`.`userId` AS `userId`,
            `ev`.`beginDate` AS `eventDate`,
            'mentor' AS `eventType`
     FROM (`ev_Mentors` `men`
           LEFT JOIN `ev_Events` `ev` on((`men`.`EventId` = `ev`.`id`))))
  UNION ALL
    (SELECT `co`.`userId` AS `userId`,
            `ev`.`beginDate` AS `eventDate`,
            'coorganizer' AS `eventType`
     FROM (`ev_Coorganizers` `co`
           LEFT JOIN `ev_Events` `ev` on((`co`.`EventId` = `ev`.`id`))));


CREATE VIEW `vw_wm_metrics_makes` AS
  SELECT 'butter' AS `src`,
         `bu_Projects`.`id` AS `id`,
         sha(concat(`bu_Projects`.`email`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`,
         `bu_Projects`.`createdAt` AS `createdAt`,
         `bu_Projects`.`updatedAt` AS `updatedAt`
  FROM `bu_Projects`
  UNION ALL
  SELECT 'thimble' AS `src`,
         `th_ThimbleProjects`.`id` AS `id`,
         sha(concat(`th_ThimbleProjects`.`userid`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`,
         `th_ThimbleProjects`.`createdAt` AS `createdAt`,
         `th_ThimbleProjects`.`updatedAt` AS `updatedAt`
  FROM `th_ThimbleProjects`
  UNION ALL
  SELECT 'goggles' AS `src`,
         `gg_ThimbleProjects`.`id` AS `id`,
         sha(concat(`gg_ThimbleProjects`.`userid`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`,
         `gg_ThimbleProjects`.`createdAt` AS `createdAt`,
         `gg_ThimbleProjects`.`updatedAt` AS `updatedAt`
  FROM `gg_ThimbleProjects`
  UNION ALL
    (SELECT 'appmaker' AS `src`,
            `app`.`id` AS `id`,
            sha(concat(`usr`.`email`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`,
            `app`.`createdAt` AS `createdAt`,
            `app`.`updatedAt` AS `updatedAt`
     FROM (`appmaker_temp` `app`
           LEFT JOIN `wl_Users` `usr` on((`usr`.`username` = convert(`app`.`username` USING utf8)))));


CREATE VIEW `vw_wm_metrics_referrers` AS
  SELECT `rid`.`referrer` AS `referrer`,
         `rid`.`userStatus` AS `userStatus`,
         `rid`.`createdAt` AS `ridCreatedAt`,
         `rid`.`updatedAt` AS `ridUpdatedAt`,
         sha(concat(`usr`.`email`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`,
         `usr`.`createdAt` AS `usrCreatedAt`,
         `usr`.`lastLoggedIn` AS `usrLastLoggedIn`
  FROM (`wl_ReferrerCodes` `rid`
        LEFT JOIN `wl_Users` `usr` on((`rid`.`UserId` = `usr`.`id`)));


CREATE VIEW `vw_wm_metrics_referrers_and_badges` AS
  SELECT `ref`.`referrer` AS `referrer`,
         `ref`.`userStatus` AS `userStatus`,
         `ref`.`createdAt` AS `ridCreatedAt`,
         `ref`.`updatedAt` AS `ridUpdatedAt`,
         `usr`.`id` AS `userId`,
         sha(concat(`usr`.`email`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`,
         `usr`.`createdAt` AS `usrCreatedAt`,
         `usr`.`lastLoggedIn` AS `usrLastLoggedIn`,
         `badges`.`description` AS `badgeName`,
         `badges`.`contribution_date` AS `badgedOn`
  FROM ((`wl_ReferrerCodes` `ref`
         LEFT JOIN `wl_Users` `usr` on((`usr`.`id` = `ref`.`UserId`)))
        JOIN `ah_contributions` `badges` on((`usr`.`email` = `badges`.`contributor_id`)))
  WHERE (`badges`.`logged_by` = 'badgekit-api');


CREATE VIEW `vw_wm_metrics_referrers_and_events` AS
  SELECT `ref`.`referrer` AS `referrer`,
         `ref`.`userStatus` AS `userStatus`,
         `ref`.`createdAt` AS `ridCreatedAt`,
         `ev`.`userId` AS `userId`,
         `ev`.`eventDate` AS `eventDate`,
         `ev`.`hostType` AS `hostType`
  FROM (`wl_ReferrerCodes` `ref`
        JOIN `vw_wm_metrics_event_host_ids` `ev` on((`ref`.`UserId` = `ev`.`userId`)));


CREATE VIEW `vw_wm_metrics_referrers_and_makes` AS
  SELECT `ref`.`referrer` AS `referrer`,
         `ref`.`userStatus` AS `userStatus`,
         `ref`.`createdAt` AS `ridCreatedAt`,
         `ref`.`updatedAt` AS `ridUpdatedAt`,
         `usr`.`id` AS `userId`,
         sha(concat(`usr`.`email`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`,
         `usr`.`createdAt` AS `usrCreatedAt`,
         `usr`.`lastLoggedIn` AS `usrLastLoggedIn`,
         `makes`.`src` AS `makeSrc`,
         `makes`.`createdAt` AS `makeCreatedAt`
  FROM ((`wl_ReferrerCodes` `ref`
         LEFT JOIN `wl_Users` `usr` on((`usr`.`id` = `ref`.`UserId`)))
        JOIN `vw_wm_INTERNAL_makes` `makes` on((`usr`.`email` = `makes`.`email`)));


CREATE VIEW `vw_wm_metrics_retention` AS
  SELECT `wl_Users`.`id` AS `id`,
         `wl_Users`.`createdAt` AS `createdAt`,
         `wl_Users`.`lastLoggedIn` AS `lastLoggedIn`,
         (to_days(now()) - to_days(`wl_Users`.`createdAt`)) AS `days_since_signup`,
         (to_days(`wl_Users`.`lastLoggedIn`) - to_days(`wl_Users`.`createdAt`)) AS `days_active`
  FROM `wl_Users`
  WHERE (`wl_Users`.`createdAt` > '2014-07-01');


CREATE VIEW `vw_wm_metrics_teaching` AS
    (SELECT `ev_Events`.`id` AS `eventId`,
            'event_host' AS `teachType`,
            `ev_Events`.`beginDate` AS `eventDate`,
            sha(concat(`ev_Events`.`organizer`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`
     FROM `ev_Events`)
  UNION ALL
    (SELECT `mntr`.`EventId` AS `eventId`,
            'event_mentor' AS `teachType`,
            `ev`.`beginDate` AS `eventDate`,
            sha(concat(`usr`.`email`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`
     FROM ((`ev_Mentors` `mntr`
            LEFT JOIN `ev_Events` `ev` on((`mntr`.`EventId` = `ev`.`id`)))
           LEFT JOIN `wl_Users` `usr` on((`mntr`.`userId` = `usr`.`id`))))
  UNION ALL
    (SELECT `coor`.`EventId` AS `eventId`,
            'event_coorganizer' AS `teachType`,
            `ev`.`beginDate` AS `eventDate`,
            sha(concat(`usr`.`email`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`
     FROM ((`ev_Coorganizers` `coor`
            LEFT JOIN `ev_Events` `ev` on((`coor`.`EventId` = `ev`.`id`)))
           LEFT JOIN `wl_Users` `usr` on((`coor`.`userId` = `usr`.`id`))));


CREATE VIEW `vw_wm_metrics_users` AS
  SELECT `wl_Users`.`id` AS `userId`,
         sha(concat(`wl_Users`.`email`,'{{{SECRETGOESHERE}}}')) AS `userIdHash`,
         `wl_Users`.`createdAt` AS `createdAt`,
         `wl_Users`.`updatedAt` AS `updatedAt`,
         `wl_Users`.`lastLoggedIn` AS `lastLoggedIn`,
         `wl_Users`.`isSuperMentor` AS `isSuperMentor`,
         `wl_Users`.`isMentor` AS `isMentor`,
         `wl_Users`.`sendEngagements` AS `sendEngagements`
  FROM `wl_Users`;


-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: skillswap
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `exchange_requests`
--

DROP TABLE IF EXISTS `exchange_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exchange_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `offered_skill_id` int NOT NULL,
  `requested_skill_id` int NOT NULL,
  `message` text,
  `status` enum('PENDING','ACCEPTED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `planned_learning_sessions` int NOT NULL DEFAULT '1',
  `planned_teaching_sessions` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `offered_skill_id` (`offered_skill_id`),
  KEY `requested_skill_id` (`requested_skill_id`),
  CONSTRAINT `exchange_requests_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exchange_requests_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exchange_requests_ibfk_3` FOREIGN KEY (`offered_skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exchange_requests_ibfk_4` FOREIGN KEY (`requested_skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exchange_requests`
--

LOCK TABLES `exchange_requests` WRITE;
/*!40000 ALTER TABLE `exchange_requests` DISABLE KEYS */;
INSERT INTO `exchange_requests` VALUES (1,2,1,22,1,'hgh','CANCELLED','2026-10-03 13:39:17','2026-10-03 14:11:25',1,1);
/*!40000 ALTER TABLE `exchange_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_progress`
--

DROP TABLE IF EXISTS `learning_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `learner_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `status` enum('IN_PROGRESS','COMPLETED','ADDED_TO_PROFILE') NOT NULL DEFAULT 'IN_PROGRESS',
  `completed_at` datetime DEFAULT NULL,
  `added_to_profile_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`,`learner_id`,`skill_id`),
  KEY `learner_id` (`learner_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `skill_id` (`skill_id`),
  CONSTRAINT `learning_progress_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `learning_progress_ibfk_2` FOREIGN KEY (`learner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `learning_progress_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `learning_progress_ibfk_4` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_progress`
--

LOCK TABLES `learning_progress` WRITE;
/*!40000 ALTER TABLE `learning_progress` DISABLE KEYS */;
INSERT INTO `learning_progress` VALUES (3,2,1,2,22,'IN_PROGRESS',NULL,NULL,'2026-10-03 13:40:08','2026-10-03 13:40:08'),(4,2,2,1,1,'IN_PROGRESS',NULL,NULL,'2026-10-03 13:40:08','2026-10-03 13:40:08');
/*!40000 ALTER TABLE `learning_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `reference_id` int DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'EXCHANGE_REQUEST','New exchange request','You received a new skill exchange request.',1,1,'2026-10-03 13:39:17'),(2,2,'REQUEST_ACCEPTED','Exchange request accepted','Your skill exchange request has been accepted.',1,0,'2026-10-03 13:39:29'),(3,2,'SESSION_CREATED','Session scheduled','A new skill exchange session has been scheduled.',1,0,'2026-10-03 13:39:45'),(4,1,'SESSION_CREATED','Session scheduled','A new skill exchange session has been scheduled.',1,1,'2026-10-03 13:39:45'),(5,2,'SESSION_CREATED','Session scheduled','A new skill exchange session has been scheduled.',2,0,'2026-10-03 13:40:08'),(6,1,'SESSION_CREATED','Session scheduled','A new skill exchange session has been scheduled.',2,1,'2026-10-03 13:40:08'),(7,2,'SESSION_CANCELLED','Session cancelled','Your skill exchange session has been cancelled.',2,0,'2026-10-03 14:10:57'),(8,1,'SESSION_CANCELLED','Session cancelled','Your skill exchange session has been cancelled.',2,0,'2026-10-03 14:10:57'),(9,2,'SESSION_CREATED','Session scheduled','A new skill exchange session has been scheduled.',3,0,'2026-10-03 14:11:02'),(10,1,'SESSION_CREATED','Session scheduled','A new skill exchange session has been scheduled.',3,0,'2026-10-03 14:11:02'),(11,2,'EXCHANGE_ENDED','Exchange ended','An active skill exchange and its future lessons were ended. Completed lesson history remains available.',1,0,'2026-10-03 14:11:25'),(12,1,'EXCHANGE_ENDED','Exchange ended','An active skill exchange and its future lessons were ended. Completed lesson history remains available.',1,0,'2026-10-03 14:11:25');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `reviewee_id` int NOT NULL,
  `rating` int NOT NULL,
  `review` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `reviewee_id` (`reviewee_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `user1_id` int NOT NULL,
  `user2_id` int NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `status` enum('SCHEDULED','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  `meeting_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `duration_minutes` int NOT NULL DEFAULT '60',
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `ended_by` int DEFAULT NULL,
  `end_reason` varchar(50) DEFAULT NULL,
  `session_number` int NOT NULL DEFAULT '1',
  `lesson_type` enum('LEARNING','TEACHING','BOTH') NOT NULL DEFAULT 'BOTH',
  `learner_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `skill_id` int DEFAULT NULL,
  `rescheduled_from_id` int DEFAULT NULL,
  `schedule_note` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  KEY `user1_id` (`user1_id`),
  KEY `user2_id` (`user2_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `exchange_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (1,1,2,1,'2026-10-03 20:09:00','CANCELLED',NULL,'2026-10-03 13:39:45','2026-10-03 14:11:25',60,NULL,'2026-10-03 19:41:25',2,'EXCHANGE_ENDED',1,'TEACHING',2,1,1,NULL,'mn'),(2,1,2,1,'2026-10-03 20:10:00','CANCELLED',NULL,'2026-10-03 13:40:08','2026-10-03 14:10:57',60,NULL,NULL,NULL,NULL,2,'LEARNING',1,2,22,NULL,NULL),(3,1,2,1,'2026-10-03 20:41:00','CANCELLED',NULL,'2026-10-03 14:11:02','2026-10-03 14:11:25',60,NULL,'2026-10-03 19:41:25',2,'EXCHANGE_ENDED',3,'LEARNING',2,1,1,NULL,NULL);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skill_categories`
--

DROP TABLE IF EXISTS `skill_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skill_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skill_categories`
--

LOCK TABLES `skill_categories` WRITE;
/*!40000 ALTER TABLE `skill_categories` DISABLE KEYS */;
INSERT INTO `skill_categories` VALUES (1,'Programming','Programming languages and fundamentals'),(2,'Web Development','Frontend and web technologies'),(3,'Database','Data storage and SQL'),(4,'Design','UI/UX and visual design'),(5,'Data & AI','Data science and artificial intelligence'),(6,'Communication','Communication and presentation skills'),(7,'Tools','Developer and collaboration tools');
/*!40000 ALTER TABLE `skill_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category_id` int DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `skills_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `skill_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (1,'C',1,'C skill','2026-10-03 13:33:27'),(2,'C++',1,'C++ skill','2026-10-03 13:33:27'),(3,'Java',1,'Java skill','2026-10-03 13:33:27'),(4,'Python',1,'Python skill','2026-10-03 13:33:27'),(5,'JavaScript',1,'JavaScript skill','2026-10-03 13:33:27'),(6,'TypeScript',1,'TypeScript skill','2026-10-03 13:33:27'),(7,'React',2,'React skill','2026-10-03 13:33:27'),(8,'Node.js',2,'Node.js skill','2026-10-03 13:33:27'),(9,'HTML',2,'HTML skill','2026-10-03 13:33:27'),(10,'CSS',2,'CSS skill','2026-10-03 13:33:27'),(11,'SQL',3,'SQL skill','2026-10-03 13:33:27'),(12,'MongoDB',3,'MongoDB skill','2026-10-03 13:33:27'),(13,'UI/UX Design',4,'UI/UX Design skill','2026-10-03 13:33:27'),(14,'Figma',4,'Figma skill','2026-10-03 13:33:27'),(15,'Graphic Design',4,'Graphic Design skill','2026-10-03 13:33:27'),(16,'Data Structures',1,'Data Structures skill','2026-10-03 13:33:27'),(17,'Machine Learning',5,'Machine Learning skill','2026-10-03 13:33:27'),(18,'Data Science',5,'Data Science skill','2026-10-03 13:33:27'),(19,'Git & GitHub',7,'Git & GitHub skill','2026-10-03 13:33:27'),(20,'Flutter',2,'Flutter skill','2026-10-03 13:33:27'),(21,'Android Development',1,'Android Development skill','2026-10-03 13:33:27'),(22,'Communication',6,'Communication skill','2026-10-03 13:33:27'),(23,'Public Speaking',6,'Public Speaking skill','2026-10-03 13:33:27');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_skills`
--

DROP TABLE IF EXISTS `user_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `type` enum('TEACH','LEARN') NOT NULL,
  `level` enum('BEGINNER','INTERMEDIATE','ADVANCED') NOT NULL DEFAULT 'BEGINNER',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`skill_id`,`type`),
  KEY `skill_id` (`skill_id`),
  CONSTRAINT `user_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_skills`
--

LOCK TABLES `user_skills` WRITE;
/*!40000 ALTER TABLE `user_skills` DISABLE KEYS */;
INSERT INTO `user_skills` VALUES (3,2,2,'LEARN','BEGINNER','2026-10-03 13:37:07'),(5,2,1,'LEARN','BEGINNER','2026-10-03 13:37:43'),(6,2,22,'TEACH','BEGINNER','2026-10-03 13:37:56'),(7,1,21,'TEACH','BEGINNER','2026-10-03 13:38:36'),(8,1,1,'TEACH','BEGINNER','2026-10-03 13:38:38'),(9,1,2,'LEARN','BEGINNER','2026-10-03 13:38:41'),(10,1,22,'LEARN','BEGINNER','2026-10-03 13:38:43');
/*!40000 ALTER TABLE `user_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `college` varchar(150) DEFAULT NULL,
  `roll_no` varchar(50) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `bio` text,
  `profile_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `roll_no` (`roll_no`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'vignesh','santhanavignesh17@gmail.com','8978978000','grgnmrkg','923324106038','BT','$2b$10$3AOgzl7.TWqPQiz/egGY0.lRcYzZq453ZCEizXt4qr4faQdLwu4si',NULL,NULL,'2026-10-03 13:33:55','2026-10-03 13:33:55'),(2,'Santhana Vignesh','vijit7223@gmail.com','5878608709','ghjfvgjv','8798770','Aeronautical','$2b$10$B09rl4MEuGLtzsrQC4/qqO8coVFPuGv.8BGNM0WSbxRu.kLkra3C.',NULL,NULL,'2026-10-03 13:36:42','2026-10-03 13:36:42');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-03 21:29:39

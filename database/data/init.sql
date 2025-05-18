create database if not exists deepface_database;
use deepface_database;

create table if not exists attendances
(
    attendance_id int auto_increment primary key,
    course_id     varchar(16) not null,
    time_limit    time        null,
    auto_end      tinyint(1)  null
);

create table if not exists courses
(
    course_id    varchar(16)  not null,
    course_name  varchar(256) not null,
    teacher_name varchar(256) not null
);

alter table courses
    add primary key (course_id);

alter table attendances
    add constraint attendances_courses_course_id_fk
        foreign key (course_id) references courses (course_id);

create table if not exists student_attendance
(
    student_id    varchar(16) not null,
    attendance_id int         not null,
    time_in       datetime    not null
);

alter table student_attendance
    add primary key (attendance_id, student_id);

alter table student_attendance
    add constraint student_attendance_attendances_attendance_id_fk
        foreign key (attendance_id) references attendances (attendance_id);

create table if not exists student_course
(
    student_id varchar(16) not null,
    course_id  varchar(16) not null
);

alter table student_course
    add primary key (student_id, course_id);

alter table student_course
    add constraint student_course_courses_course_id_fk
        foreign key (course_id) references courses (course_id);

create table if not exists student_image
(
    image_id        int auto_increment  primary key,
    student_id      varchar(16) not null,
    base64_image    longtext        not null
);

create table if not exists students
(
    student_id   varchar(16)  not null,
    student_name varchar(256) not null
);

alter table students
    add primary key (student_id);

alter table student_attendance
    add constraint student_attendance_students_student_id_fk
        foreign key (student_id) references students (student_id);

alter table student_course
    add constraint student_course_students_student_id_fk
        foreign key (student_id) references students (student_id);

alter table student_image
    add constraint student_image_students_student_id_fk
        foreign key (student_id) references students (student_id);



-- insert into courses (course_id, course_name, teacher_name) values
-- ('INT3405-1', 'Học máy', 'Hoàng Thanh Tùng'),
-- ('AIT3005-2', 'Seminar khoa học', 'Nguyễn Việt Hà'),
-- ('INT2211-37', 'Cơ sở dữ liệu', 'Trần Hồng Việt'),
-- ('MAT1041-1', 'Giải tích I', 'Trần Thị Thu Hà');

-- insert into students (student_id, student_name) values
-- ('23020001', 'Nguyễn Văn A'),
-- ('23020002', 'Nguyễn Văn B'),
-- ('23020003', 'Nguyễn Văn C'),
-- ('23020004', 'Nguyễn Văn D');

-- insert into student_course (student_id, course_id) values
-- ('23020001', 'INT3405-1'),
-- ('23020001', 'AIT3005-2'),
-- ('23020002', 'INT3405-1'),
-- ('23020002', 'INT2211-37'),
-- ('23020003', 'MAT1041-1'),
-- ('23020004', 'INT3405-1');
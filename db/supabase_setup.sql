-- ============================================
-- Supabase Setup Script for Map Tracking System
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================
-- Creates the schema (tables, constraints, RLS policies) and a
-- storage bucket for photo uploads.  Test data is included at the
-- bottom — remove before going live.
-- ============================================

-- volunteers: pre-registered internal accounts (no public signup).
-- SECURITY NOTE: demo stores passwords in plaintext.  In production,
-- use Supabase Auth or store hashed passwords + compare server-side.
CREATE TABLE volunteers (
  user_id TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT
);

-- Insert 10 pre-registered volunteers
INSERT INTO volunteers (user_id, password, name) VALUES 
  ('2016040195', 'HQJakut1TzuChi', 'Admin Volunteer 1'),
  ('2016040196', 'HQJakut1TzuChi', 'Admin Volunteer 2'),
  ('2016040197', 'HQJakut1TzuChi', 'Admin Volunteer 3'),
  ('2016040198', 'HQJakut1TzuChi', 'Admin Volunteer 4'),
  ('2016040199', 'HQJakut1TzuChi', 'Admin Volunteer 5'),
  ('2016040200', 'HQJakut1TzuChi', 'Admin Volunteer 6'),
  ('2016040201', 'HQJakut1TzuChi', 'Admin Volunteer 7'),
  ('2016040202', 'HQJakut1TzuChi', 'Admin Volunteer 8'),
  ('2016040203', 'HQJakut1TzuChi', 'Admin Volunteer 9'),
  ('2016040204', 'HQJakut1TzuChi', 'Admin Volunteer 10');

-- houses: core domain table — each row is a visit target shown on the map.
-- CHECK constraints lock status/priority/type to fixed labels so that
-- UI filters and colour-coding stay consistent with the database.
-- links and photos use JSONB arrays for flexible, schema-less storage.
CREATE TABLE houses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Orphanage', 'Nursing Home', 'Rest House')),
  status TEXT CHECK (status IN ('new case', 'active care', 'follow-up', 'closed')) DEFAULT 'new case',
  priority TEXT CHECK (priority IN ('urgent', 'normal', 'stable')) DEFAULT 'normal',
  last_visit_date DATE,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  contact TEXT,
  notes TEXT,
  doc_link TEXT,
  doc_name TEXT,
  sheet_link TEXT,
  sheet_name TEXT,
  links JSONB DEFAULT '[]',       -- array of { name, url } objects
  photos JSONB DEFAULT '[]',      -- array of { url, path, name, caption }
  last_modified_by TEXT,
  last_modified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- TEST DATA (Remove this section before going live!)
-- These are sample houses for testing only.
-- In production, houses are added through the app.
-- ============================================

-- Insert houses scattered around Jakarta bounds
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes) VALUES
  ('Panti Asuhan Cahaya', 'Orphanage', 'new case', 'normal', -6.155, 106.850, '081299887766', 'Need to check inventory of school supplies.'),
  ('Wisma Werdha Sejahtera', 'Nursing Home', 'active care', 'stable', -6.170, 106.810, '085611223344', 'Dropped off adult diapers and basic medicines.'),
  ('Rumah Singgah Harapan', 'Rest House', 'active care', 'urgent', -6.180, 106.900, '087855667788', 'Roof leak reported, needs immediate inspection.'),
  ('Yayasan Sayangi Tunas', 'Orphanage', 'active care', 'stable', -6.130, 106.750, '089912341234', 'Completed monthly health checkup.'),
  ('Panti Jompo Karya Kasih', 'Nursing Home', 'active care', 'urgent', -6.200, 106.840, '081199998888', 'Low on rice and cooking oil.'),
  ('Rumah Istirahat Damai', 'Rest House', 'new case', 'normal', -6.220, 106.880, '081344556677', 'Scheduling a structural assessment.'),
  ('Panti Asuhan Berkat', 'Orphanage', 'new case', 'normal', -6.110, 106.780, '085711221122', 'Planning to bring volunteers for tutoring session.'),
  ('Wisma Lansia Melati', 'Nursing Home', 'active care', 'stable', -6.195, 106.730, '087788990011', 'Delivered wheelchairs.'),
  ('Panti Asuhan Pelangi', 'Orphanage', 'active care', 'urgent', -6.145, 106.865, '081233445566', 'Urgent need for baby formula and clothes.'),
  ('Rumah Singgah Peduli', 'Rest House', 'active care', 'stable', -6.165, 106.910, '089877665544', 'Brought fresh mattresses.'),
  ('Yayasan Kasih Bunda', 'Orphanage', 'active care', 'stable', -6.215, 106.825, '081122334455', 'Distributed new school bags.'),
  ('Panti Werdha Mulia', 'Nursing Home', 'new case', 'normal', -6.125, 106.950, '081566778899', 'Need to coordinate with doctors for next visit.'),
  ('Rumah Persinggahan Kasih', 'Rest House', 'active care', 'urgent', -6.185, 106.770, '081288889999', 'Water pump is broken.'),
  ('Panti Asuhan Bintang', 'Orphanage', 'new case', 'normal', -6.205, 106.970, '087811223344', 'Gathering books for their new library.'),
  ('Wisma Ketenangan', 'Nursing Home', 'active care', 'urgent', -6.135, 106.835, '085699887766', 'Shortage of volunteer caretakers reported.'),
  ('Panti Asuhan Sinar Mentari', 'Orphanage', 'active care', 'stable', -6.160, 106.790, '081377882233', 'Donated school uniforms for 30 children.'),
  ('Wisma Lansia Harmoni', 'Nursing Home', 'new case', 'normal', -6.175, 106.920, '085244556699', 'Planning eye checkup event with local clinic.'),
  ('Rumah Singgah Matahari', 'Rest House', 'active care', 'urgent', -6.140, 106.870, '087611998877', 'Electrical wiring needs replacement urgently.'),
  ('Yayasan Anak Bangsa', 'Orphanage', 'new case', 'normal', -6.190, 106.800, '081455667722', 'Coordinating art supplies donation from school.'),
  ('Panti Jompo Sentosa', 'Nursing Home', 'active care', 'stable', -6.210, 106.860, '089933445511', 'Delivered blood pressure monitors and vitamins.'),
  ('Rumah Istirahat Bahagia', 'Rest House', 'active care', 'stable', -6.150, 106.940, '081266778800', 'Installed new water heater for bathing area.'),
  ('Panti Asuhan Tunas Harapan', 'Orphanage', 'active care', 'urgent', -6.225, 106.815, '085188994433', 'Running low on milk powder and diapers.'),
  ('Wisma Werdha Kasih Sayang', 'Nursing Home', 'active care', 'urgent', -6.120, 106.890, '087722113366', 'Need more beds, currently overcrowded.'),
  ('Rumah Singgah Cinta Kasih', 'Rest House', 'new case', 'normal', -6.200, 106.760, '081599887744', 'Preparing for roof renovation next month.'),
  ('Panti Asuhan Gemilang', 'Orphanage', 'active care', 'stable', -6.148, 106.810, '081344998822', 'Brought toys and stationery for 20 kids.'),
  ('Wisma Lansia Damai Sejahtera', 'Nursing Home', 'new case', 'normal', -6.188, 106.855, '085277661133', 'Arranging physiotherapy sessions for residents.'),
  ('Rumah Singgah Cahaya Baru', 'Rest House', 'active care', 'urgent', -6.170, 106.780, '087699112244', 'Bathroom plumbing needs urgent repair.'),
  ('Yayasan Pelita Hati', 'Orphanage', 'active care', 'urgent', -6.230, 106.900, '081488773355', 'Children need tutoring help for school exams.'),
  ('Panti Jompo Budi Luhur', 'Nursing Home', 'active care', 'stable', -6.115, 106.845, '089955446622', 'Delivered hearing aids and reading glasses.'),
  ('Rumah Istirahat Sejuk', 'Rest House', 'new case', 'normal', -6.195, 106.930, '081266553311', 'Scouting location for community garden project.'),
  ('Panti Asuhan Fatimah', 'Orphanage', 'active care', 'stable', -6.142, 106.822, '081300112233', 'Monthly food distribution completed.'),
  ('Wisma Werdha Abadi', 'Nursing Home', 'active care', 'urgent', -6.178, 106.875, '085244001122', 'AC units broken in two rooms.'),
  ('Rumah Singgah Permata', 'Rest House', 'new case', 'normal', -6.162, 106.795, '087600334455', 'Meeting with local government scheduled.'),
  ('Yayasan Mutiara Bangsa', 'Orphanage', 'active care', 'urgent', -6.208, 106.838, '081455667700', 'Textbooks needed for new school year.'),
  ('Panti Jompo Cempaka', 'Nursing Home', 'active care', 'stable', -6.133, 106.910, '089900556677', 'Distributed walking canes and grab bars.'),
  ('Rumah Istirahat Anggrek', 'Rest House', 'active care', 'stable', -6.218, 106.785, '081277889900', 'Painted exterior walls and fixed gate.'),
  ('Panti Asuhan Mawar', 'Orphanage', 'new case', 'normal', -6.152, 106.855, '085111002233', 'Planning birthday celebration for kids.'),
  ('Wisma Lansia Teratai', 'Nursing Home', 'new case', 'normal', -6.192, 106.815, '087744556600', 'Coordinating dental checkup day.'),
  ('Rumah Singgah Melati', 'Rest House', 'active care', 'urgent', -6.172, 106.925, '081366778811', 'Kitchen stove needs replacement.'),
  ('Panti Asuhan Lestari', 'Orphanage', 'active care', 'stable', -6.128, 106.868, '089911223300', 'Art workshop conducted successfully.'),
  ('Wisma Werdha Seroja', 'Nursing Home', 'active care', 'urgent', -6.205, 106.798, '081488990011', 'Short on insulin supplies.'),
  ('Rumah Istirahat Kenanga', 'Rest House', 'new case', 'normal', -6.168, 106.940, '085233445566', 'Applying for renovation grant.'),
  ('Yayasan Harapan Mulia', 'Orphanage', 'active care', 'urgent', -6.235, 106.820, '087677889922', 'Need winter blankets for rainy season.'),
  ('Panti Jompo Anyelir', 'Nursing Home', 'active care', 'stable', -6.118, 106.850, '081599001122', 'Blood donation drive held successfully.'),
  ('Rumah Singgah Flamboyan', 'Rest House', 'active care', 'stable', -6.182, 106.765, '089922334411', 'New furniture delivered and assembled.'),
  ('Panti Asuhan Dahlia', 'Orphanage', 'new case', 'normal', -6.158, 106.895, '081344556633', 'Planning computer literacy program.'),
  ('Wisma Lansia Bougenville', 'Nursing Home', 'new case', 'normal', -6.198, 106.830, '085266778844', 'Recruiting volunteer nurses.'),
  ('Rumah Istirahat Sakura', 'Rest House', 'active care', 'urgent', -6.145, 106.775, '087699001155', 'Septic tank overflow reported.'),
  ('Yayasan Lentera Kasih', 'Orphanage', 'active care', 'stable', -6.222, 106.865, '081477882266', 'Distributed Eid gifts to all children.'),
  ('Panti Jompo Gardenia', 'Nursing Home', 'active care', 'urgent', -6.138, 106.915, '089933440077', 'Two residents need hospital referral.'),
  ('Rumah Singgah Lavender', 'Rest House', 'new case', 'normal', -6.175, 106.805, '081255667788', 'Fundraising event being planned.'),
  ('Panti Asuhan Seruni', 'Orphanage', 'active care', 'urgent', -6.212, 106.845, '085100223344', 'Playground equipment is rusted and unsafe.'),
  ('Wisma Werdha Kamboja', 'Nursing Home', 'active care', 'stable', -6.125, 106.880, '087733441166', 'Karaoke night for residents was a hit.'),
  ('Rumah Istirahat Tulip', 'Rest House', 'active care', 'stable', -6.190, 106.755, '081388990022', 'Mosquito nets installed in all rooms.'),
  ('Yayasan Pancaran Ilmu', 'Orphanage', 'new case', 'normal', -6.155, 106.835, '089944552233', 'Setting up small library corner.'),
  ('Panti Jompo Marigold', 'Nursing Home', 'new case', 'normal', -6.228, 106.875, '081466773344', 'Planning group exercise sessions.'),
  ('Rumah Singgah Jasmine', 'Rest House', 'active care', 'urgent', -6.165, 106.950, '085277884455', 'Front door lock is jammed.'),
  ('Panti Asuhan Wijaya', 'Orphanage', 'active care', 'stable', -6.202, 106.810, '087688995566', 'Haircut day for 25 children completed.'),
  ('Wisma Lansia Aster', 'Nursing Home', 'active care', 'urgent', -6.132, 106.860, '081599006677', 'Wheelchair ramp needs widening.'),
  ('Rumah Istirahat Orchid', 'Rest House', 'new case', 'normal', -6.185, 106.920, '089955117788', 'Scouting solar panel installation options.'),
  ('Yayasan Bakti Nusantara', 'Orphanage', 'active care', 'urgent', -6.148, 106.800, '081344228899', 'Urgent: roof tiles missing after storm.'),
  ('Panti Jompo Lily', 'Nursing Home', 'active care', 'stable', -6.215, 106.850, '085266339900', 'Movie screening event held for residents.'),
  ('Rumah Singgah Edelweiss', 'Rest House', 'active care', 'stable', -6.170, 106.770, '087600441011', 'Water filter system installed.'),
  ('Panti Asuhan Cendana', 'Orphanage', 'new case', 'normal', -6.195, 106.895, '081477552122', 'Organizing swimming lessons at local pool.'),
  ('Wisma Werdha Magnolia', 'Nursing Home', 'new case', 'normal', -6.122, 106.835, '089933663233', 'Arranging traditional music therapy.'),
  ('Rumah Istirahat Chrysant', 'Rest House', 'active care', 'urgent', -6.180, 106.960, '081255774344', 'Ceiling fan in main hall stopped working.'),
  ('Yayasan Surya Mandiri', 'Orphanage', 'active care', 'stable', -6.238, 106.830, '085188885455', 'Science fair for kids was a success.'),
  ('Panti Jompo Violet', 'Nursing Home', 'active care', 'urgent', -6.140, 106.905, '087699996566', 'Emergency button system malfunctioning.'),
  ('Rumah Singgah Peony', 'Rest House', 'new case', 'normal', -6.160, 106.745, '081366007677', 'Planning clean water well project.'),
  ('Panti Asuhan Nirwana', 'Orphanage', 'active care', 'stable', -6.205, 106.870, '089944118788', 'Music instruments donated by local band.'),
  ('Wisma Lansia Iris', 'Nursing Home', 'active care', 'stable', -6.175, 106.825, '081477229899', 'Tai chi classes started every morning.'),
  ('Rumah Istirahat Daffodil', 'Rest House', 'active care', 'urgent', -6.152, 106.885, '085200330900', 'Drainage system clogged after heavy rain.'),
  ('Yayasan Bintang Kejora', 'Orphanage', 'new case', 'normal', -6.225, 106.805, '087611442011', 'Coordinating with school for enrollment.'),
  ('Panti Jompo Sunflower', 'Nursing Home', 'new case', 'normal', -6.130, 106.870, '081388553122', 'Designing sensory garden for therapy.'),
  ('Rumah Singgah Poppy', 'Rest House', 'active care', 'stable', -6.188, 106.790, '089955664233', 'Donated 10 new mattresses and pillows.'),
  ('Panti Asuhan Kemuning', 'Orphanage', 'active care', 'urgent', -6.162, 106.915, '081466775344', 'School bus needs engine repair.'),
  ('Wisma Werdha Carnation', 'Nursing Home', 'active care', 'stable', -6.210, 106.840, '085277886455', 'Cooking class held with local chef.'),
  ('Rumah Istirahat Begonia', 'Rest House', 'new case', 'normal', -6.145, 106.810, '087688997566', 'Planning rainwater harvesting system.'),
  ('Yayasan Cipta Karya', 'Orphanage', 'active care', 'stable', -6.200, 106.855, '081599008677', 'Vocational training program launched.');

-- ============================================
-- EDGE CASE TEST DATA (stress test for UI)
-- ============================================

-- Houses with very long names
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes) VALUES
  ('Panti Asuhan Yayasan Kasih Sayang Anak-Anak Indonesia Timur Cabang Jakarta Utara', 'Orphanage', 'active care', 'stable', -6.137, 106.842, '081200001111', 'Testing long name display.'),
  ('Wisma Werdha Pelayanan Kesejahteraan Sosial Lanjut Usia Provinsi DKI Jakarta', 'Nursing Home', 'new case', 'normal', -6.183, 106.878, '085200002222', 'Another long name test.');

-- Houses with long notes
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes) VALUES
  ('Panti Uji Catatan Panjang', 'Orphanage', 'active care', 'urgent', -6.155, 106.815, '081300003333', 'Visit Report 03/03/2026: Arrived at 09:00. Met with facility director Ibu Sari. Discussed critical needs including: (1) Roof repair in Building B - estimated cost Rp 15 million, contractor has been contacted. (2) Need 50 sets of school uniforms for upcoming semester. (3) Kitchen refrigerator broken since last week, food spoilage risk. (4) Three children have dental issues requiring clinic visit. (5) Water heater in bathroom #2 leaking. Follow-up scheduled for next Tuesday. Volunteer team of 8 people needed for the repair work. Budget approval pending from regional office. Priority: HIGH.');

-- Houses near Jakarta boundary edges
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes) VALUES
  ('Rumah Batas Utara', 'Rest House', 'new case', 'normal', -6.090, 106.850, '087400004444', 'Near northern Jakarta boundary.'),
  ('Rumah Batas Selatan', 'Rest House', 'active care', 'stable', -6.370, 106.830, '087400005555', 'Near southern Jakarta boundary.'),
  ('Rumah Batas Barat', 'Rest House', 'active care', 'urgent', -6.200, 106.680, '087400006666', 'Near western Jakarta boundary.'),
  ('Rumah Batas Timur', 'Rest House', 'new case', 'normal', -6.200, 107.000, '087400007777', 'Near eastern Jakarta boundary.');

-- Houses with pre-populated documents/links (tests the Documents section)
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes, links) VALUES
  ('Panti Asuhan Dokumentasi Lengkap', 'Orphanage', 'active care', 'stable', -6.160, 106.830, '081500008888', 'This house has many documents attached.',
   '[{"name":"Visit Report Jan 2026","url":"https://docs.google.com/document/d/example1"},{"name":"Budget Spreadsheet Q1","url":"https://docs.google.com/spreadsheets/d/example2"},{"name":"Photo Album Dec 2025","url":"https://drive.google.com/drive/folders/example3"},{"name":"Donation Receipt","url":"https://docs.google.com/document/d/example4"},{"name":"Volunteer Schedule","url":"https://docs.google.com/spreadsheets/d/example5"}]'),
  ('Wisma Lansia Berkas Banyak', 'Nursing Home', 'active care', 'urgent', -6.190, 106.860, '085600009999', 'Testing many documents display.',
   '[{"name":"Medical Records Summary","url":"https://docs.google.com/document/d/example6"},{"name":"Medication Inventory","url":"https://docs.google.com/spreadsheets/d/example7"},{"name":"Emergency Contacts","url":"https://docs.google.com/document/d/example8"},{"name":"Floor Plan","url":"https://drive.google.com/file/d/example9"},{"name":"Insurance Documents","url":"https://docs.google.com/document/d/example10"},{"name":"Inspection Report 2025","url":"https://docs.google.com/document/d/example11"},{"name":"Renovation Proposal","url":"https://docs.google.com/document/d/example12"}]');

-- House with no contact info (edge case)
INSERT INTO houses (name, type, status, priority, lat, lng, notes) VALUES
  ('Rumah Tanpa Kontak', 'Rest House', 'active care', 'urgent', -6.170, 106.895, 'No contact information available for this location.');

-- House with no notes (edge case)
INSERT INTO houses (name, type, status, priority, lat, lng, contact) VALUES
  ('Panti Tanpa Catatan', 'Orphanage', 'new case', 'normal', -6.145, 106.805, '081700001234');

-- Duplicate names (tests the "house with this name already exists" warning)
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes) VALUES
  ('Panti Asuhan Cahaya', 'Orphanage', 'active care', 'urgent', -6.157, 106.852, '081200009999', 'Duplicate name on purpose — tests the warning popup.'),
  ('Panti Asuhan Cahaya', 'Orphanage', 'active care', 'stable', -6.153, 106.848, '081200008888', 'Third duplicate — how does the UI handle it?');

-- Overlapping coordinates (tests "house nearby" warning — within ~50m of each other)
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes) VALUES
  ('Rumah Dekat A', 'Rest House', 'active care', 'stable', -6.180000, 106.840000, '087400001111', 'Right next to Rumah Dekat B.'),
  ('Rumah Dekat B', 'Rest House', 'new case', 'normal', -6.180003, 106.840004, '087400002222', 'Right next to Rumah Dekat A — almost same pin.');

-- Special characters in names
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes) VALUES
  ('Panti "Harapan & Kasih" (Cab. 2)', 'Orphanage', 'active care', 'stable', -6.165, 106.835, '081333445566', 'Tests quotes, ampersand, parentheses in name.'),
  ('Wisma Lansia — Blok C/D #3', 'Nursing Home', 'new case', 'normal', -6.198, 106.810, '085244667788', 'Tests em dash, slashes, hash symbol.');

-- House with max photos pre-populated (tests photo limit — upload button should be disabled)
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes, photos) VALUES
  ('Panti Foto Penuh', 'Orphanage', 'active care', 'stable', -6.175, 106.850, '081444556677', 'This house has 10 photos — upload should be blocked.',
   '[{"url":"https://placehold.co/400x300/e74c3c/fff?text=Photo+1","path":"test/1.jpg","name":"Front entrance","caption":"Main gate view"},{"url":"https://placehold.co/400x300/3498db/fff?text=Photo+2","path":"test/2.jpg","name":"Dining hall","caption":"Lunch time"},{"url":"https://placehold.co/400x300/2ecc71/fff?text=Photo+3","path":"test/3.jpg","name":"Bedroom A","caption":"Renovated"},{"url":"https://placehold.co/400x300/9b59b6/fff?text=Photo+4","path":"test/4.jpg","name":"Playground","caption":"New swings"},{"url":"https://placehold.co/400x300/f39c12/fff?text=Photo+5","path":"test/5.jpg","name":"Kitchen","caption":"Clean and tidy"},{"url":"https://placehold.co/400x300/1abc9c/fff?text=Photo+6","path":"test/6.jpg","name":"Library","caption":"200 books"},{"url":"https://placehold.co/400x300/e67e22/fff?text=Photo+7","path":"test/7.jpg","name":"Bathroom","caption":"Recently tiled"},{"url":"https://placehold.co/400x300/34495e/fff?text=Photo+8","path":"test/8.jpg","name":"Garden","caption":"Herb garden"},{"url":"https://placehold.co/400x300/c0392b/fff?text=Photo+9","path":"test/9.jpg","name":"Storage room","caption":"Well organized"},{"url":"https://placehold.co/400x300/16a085/fff?text=Photo+10","path":"test/10.jpg","name":"Roof repair","caption":"Work in progress"}]');

-- Bare minimum house (only required fields)
INSERT INTO houses (name, type, lat, lng) VALUES
  ('Minimal House', 'Rest House', -6.155, 106.870);

-- Additional houses to reach 156 total for stress testing
INSERT INTO houses (name, type, status, priority, lat, lng, contact, notes) VALUES
  ('Panti Asuhan Cipta Cinta', 'Orphanage', 'active care', 'stable', -6.143, 106.823, '081200110011', 'Monthly food supply delivered.'),
  ('Wisma Werdha Sentosa Abadi', 'Nursing Home', 'new case', 'normal', -6.187, 106.891, '085211220022', 'Initial assessment pending.'),
  ('Rumah Singgah Bukit Harapan', 'Rest House', 'active care', 'urgent', -6.167, 106.757, '087622330033', 'Flooding risk near drainage canal.'),
  ('Yayasan Pelita Bangsa', 'Orphanage', 'active care', 'stable', -6.213, 106.847, '081333440044', 'Computer class scheduled weekly.'),
  ('Panti Jompo Sejahtera Mulia', 'Nursing Home', 'active care', 'urgent', -6.127, 106.873, '089944550055', 'Three residents need specialist referral.'),
  ('Rumah Istirahat Bunga Melati', 'Rest House', 'new case', 'normal', -6.197, 106.773, '081455660066', 'Roof inspection due next month.'),
  ('Panti Asuhan Kasih Ibu', 'Orphanage', 'follow-up', 'normal', -6.153, 106.903, '085266770077', 'Follow-up on education sponsorship application.'),
  ('Wisma Lansia Bahagia Selalu', 'Nursing Home', 'active care', 'stable', -6.177, 106.817, '087677880088', 'Morning exercise program running well.'),
  ('Rumah Singgah Terang Benderang', 'Rest House', 'active care', 'urgent', -6.137, 106.857, '081488990099', 'Generator broken, no backup power.'),
  ('Yayasan Tunas Bangsa Muda', 'Orphanage', 'active care', 'stable', -6.207, 106.793, '089900110100', 'Art supplies fund approved.'),
  ('Panti Asuhan Citra Kasih', 'Orphanage', 'new case', 'normal', -6.163, 106.937, '081211220111', 'Enrollment application submitted.'),
  ('Wisma Werdha Damai Abadi', 'Nursing Home', 'active care', 'urgent', -6.193, 106.763, '085222330122', 'Medication supply running low.'),
  ('Rumah Singgah Bintang Timur', 'Rest House', 'active care', 'stable', -6.147, 106.843, '087633440133', 'New beds installed last week.'),
  ('Yayasan Mentari Pagi', 'Orphanage', 'active care', 'urgent', -6.217, 106.883, '081444550144', 'Urgent: water heater malfunction.'),
  ('Panti Jompo Kasih Mulia', 'Nursing Home', 'new case', 'normal', -6.133, 106.913, '089955660155', 'Awaiting physiotherapy volunteer.'),
  ('Rumah Istirahat Pelangi Indah', 'Rest House', 'follow-up', 'normal', -6.173, 106.783, '081466770166', 'Follow-up on renovation grant.'),
  ('Panti Asuhan Harapan Jaya', 'Orphanage', 'active care', 'stable', -6.203, 106.853, '085277880177', 'Library expansion project underway.'),
  ('Wisma Lansia Cempaka Putih', 'Nursing Home', 'active care', 'stable', -6.157, 106.923, '087688990188', 'Blood pressure monitoring weekly.'),
  ('Rumah Singgah Sari Bumi', 'Rest House', 'active care', 'urgent', -6.187, 106.743, '081499000199', 'Pest control needed urgently.'),
  ('Yayasan Dharma Pertiwi', 'Orphanage', 'new case', 'normal', -6.223, 106.813, '089900110200', 'New registration from community referral.'),
  ('Panti Asuhan Budi Mulia', 'Orphanage', 'active care', 'stable', -6.141, 106.867, '081211220211', 'Donated 50 school kits.'),
  ('Wisma Werdha Kenangan Indah', 'Nursing Home', 'active care', 'urgent', -6.181, 106.897, '085222330222', 'Elevator maintenance overdue.'),
  ('Rumah Singgah Angin Segar', 'Rest House', 'new case', 'normal', -6.151, 106.777, '087633440233', 'Site visit scheduled for next week.'),
  ('Yayasan Kasih Bangsa', 'Orphanage', 'active care', 'stable', -6.211, 106.837, '081444550244', 'Music class introduced on Saturdays.'),
  ('Panti Jompo Harmoni Lestari', 'Nursing Home', 'follow-up', 'normal', -6.131, 106.907, '089955660255', 'Follow-up on dental checkup plan.'),
  ('Rumah Istirahat Purnama', 'Rest House', 'active care', 'urgent', -6.171, 106.947, '081466770266', 'Water pump failure, needs replacement.'),
  ('Panti Asuhan Matahari Terbit', 'Orphanage', 'active care', 'urgent', -6.201, 106.787, '085277880277', 'Urgent need for winter clothing.'),
  ('Wisma Lansia Senja Damai', 'Nursing Home', 'new case', 'normal', -6.161, 106.827, '087688990288', 'Intake assessment being arranged.'),
  ('Rumah Singgah Pantai Mutiara', 'Rest House', 'active care', 'stable', -6.191, 106.877, '081499000299', 'Garden project completed.'),
  ('Yayasan Bina Bangsa Cerdas', 'Orphanage', 'active care', 'stable', -6.139, 106.843, '089900110300', 'Scholarship program for 10 children.'),
  ('Panti Asuhan Graha Kasih', 'Orphanage', 'new case', 'normal', -6.169, 106.913, '081211220311', 'Building assessment in progress.'),
  ('Wisma Werdha Bunga Bakung', 'Nursing Home', 'active care', 'stable', -6.199, 106.753, '085222330322', 'Weekly massage therapy sessions.'),
  ('Rumah Singgah Gunung Merapi', 'Rest House', 'active care', 'urgent', -6.149, 106.883, '087633440333', 'Structural crack found in wall.'),
  ('Yayasan Pendidikan Nusantara', 'Orphanage', 'active care', 'stable', -6.219, 106.823, '081444550344', 'Computer lab equipment donated.'),
  ('Panti Jompo Teratai Emas', 'Nursing Home', 'active care', 'urgent', -6.129, 106.863, '089955660355', 'Two residents hospitalised this week.'),
  ('Rumah Istirahat Mentari Sore', 'Rest House', 'follow-up', 'normal', -6.179, 106.793, '081466770366', 'Follow-up on plumbing repair estimate.'),
  ('Panti Asuhan Cendrawasih', 'Orphanage', 'active care', 'stable', -6.209, 106.933, '085277880377', 'Annual health screening completed.'),
  ('Wisma Lansia Pandan Wangi', 'Nursing Home', 'new case', 'normal', -6.159, 106.763, '087688990388', 'Referral from local hospital.'),
  ('Rumah Singgah Batu Karang', 'Rest House', 'active care', 'stable', -6.189, 106.843, '081499000399', 'Solar panel installation completed.'),
  ('Yayasan Karya Peduli', 'Orphanage', 'active care', 'urgent', -6.229, 106.873, '089900110400', 'Urgent textbook shortage for new term.'),
  ('Panti Asuhan Kartini Muda', 'Orphanage', 'follow-up', 'normal', -6.144, 106.817, '081211220411', 'Follow-up on sponsorship paperwork.'),
  ('Wisma Werdha Cemara Indah', 'Nursing Home', 'active care', 'stable', -6.184, 106.907, '085222330422', 'Cooking workshop every Wednesday.'),
  ('Rumah Singgah Karang Taruna', 'Rest House', 'new case', 'normal', -6.154, 106.777, '087633440433', 'Community center partnership proposed.'),
  ('Yayasan Amal Bhakti', 'Orphanage', 'active care', 'stable', -6.214, 106.847, '081444550444', 'Sports equipment fund secured.'),
  ('Panti Jompo Wijaya Kusuma', 'Nursing Home', 'active care', 'urgent', -6.134, 106.897, '089955660455', 'Wheelchair ramp needs rebuilding.'),
  ('Rumah Istirahat Lembah Hijau', 'Rest House', 'active care', 'stable', -6.174, 106.927, '081466770466', 'Rainwater harvesting system operational.'),
  ('Panti Asuhan Permata Hati', 'Orphanage', 'active care', 'urgent', -6.204, 106.797, '085277880477', 'Kitchen equipment badly damaged.'),
  ('Wisma Lansia Taman Sari', 'Nursing Home', 'new case', 'normal', -6.164, 106.837, '087688990488', 'Initial visit to assess resident needs.'),
  ('Rumah Singgah Danau Biru', 'Rest House', 'active care', 'stable', -6.194, 106.867, '081499000499', 'Community event hosted successfully.'),
  ('Yayasan Tunas Mekar', 'Orphanage', 'new case', 'normal', -6.146, 106.803, '089900110500', 'Registration from outreach program.'),
  ('Panti Asuhan Nusa Indah', 'Orphanage', 'active care', 'stable', -6.176, 106.853, '081211220511', 'Swimming lessons arranged at local pool.'),
  ('Wisma Werdha Anggrek Bulan', 'Nursing Home', 'active care', 'urgent', -6.206, 106.783, '085222330522', 'Emergency call system needs repair.'),
  ('Rumah Singgah Kencana', 'Rest House', 'follow-up', 'normal', -6.136, 106.833, '087633440533', 'Follow-up on grant application status.'),
  ('Yayasan Sumber Kasih', 'Orphanage', 'active care', 'stable', -6.166, 106.893, '081444550544', 'After-school tutoring going strong.'),
  ('Panti Jompo Sekar Melati', 'Nursing Home', 'active care', 'stable', -6.196, 106.813, '089955660555', 'Reading circle meets every Friday.'),
  ('Rumah Istirahat Padang Rumput', 'Rest House', 'active care', 'urgent', -6.156, 106.943, '081466770566', 'Sewage pipe burst, urgent repair.'),
  ('Panti Asuhan Bintang Kejora 2', 'Orphanage', 'new case', 'normal', -6.226, 106.808, '085277880577', 'Branch office of Bintang Kejora.'),
  ('Wisma Lansia Flamboyan Indah', 'Nursing Home', 'active care', 'stable', -6.142, 106.878, '087688990588', 'Delivered 20 sets of reading materials.');

-- Populate last_visit_date for houses with active care status (random dates within last 90 days)
UPDATE houses SET last_visit_date = CURRENT_DATE - (floor(random() * 30))::int
  WHERE status = 'active care' AND priority = 'stable';
UPDATE houses SET last_visit_date = CURRENT_DATE - (floor(random() * 14))::int
  WHERE status = 'active care' AND priority = 'urgent';
UPDATE houses SET last_visit_date = CURRENT_DATE - (floor(random() * 60 + 30))::int
  WHERE status = 'follow-up';
-- new case and closed houses have no last_visit_date (NULL = never visited)


-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- RLS is enabled so the anon key can only do what policies allow.
-- Currently all operations are public (demo).  For production,
-- restrict writes to authenticated users only.
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on volunteers" ON volunteers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on houses" ON houses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on houses" ON houses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on houses" ON houses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on houses" ON houses FOR DELETE USING (true);

-- ============================================
-- Storage bucket for house photos
-- ============================================
-- Public bucket — photos are accessible without auth tokens.
-- The JS client compresses images before upload (see resizeImage in mts-utils.js).
INSERT INTO storage.buckets (id, name, public) VALUES ('house-photos', 'house-photos', true);

CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'house-photos');
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'house-photos');
CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE USING (bucket_id = 'house-photos');
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'house-photos');

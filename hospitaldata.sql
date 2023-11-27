-- Insert data into the hospitals table
INSERT INTO hospitals (hospital_name, hospital_address, hospital_state)
VALUES
  ('Edwards Hospital', '123 Main St', 'Illinois'),
  ('Rush Copley Medical Center', '456 Elm St', 'Illinois');

-- Insert data into the hospital_attributes table, relating attributes to hospitals
INSERT INTO hospital_attributes (hospital_id, readmission_rate, cost_effectiveness, patient_satisfaction)
VALUES
  (1, 0.180, 0.8, 4.4),
  (2, 0.183, 0.72, 2.6);

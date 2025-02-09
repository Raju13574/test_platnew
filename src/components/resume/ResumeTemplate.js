import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Clean, professional styles matching the image
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  section: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    marginBottom: 5,
  },
  headline: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 5,
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 3,
  },
  profilesSection: {
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  experienceItem: {
    marginBottom: 15,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  companyName: {
    fontWeight: 'bold',
  },
  position: {
    marginBottom: 3,
  },
  location: {
    textAlign: 'right',
  },
  bulletPoint: {
    marginBottom: 3,
    flexDirection: 'row',
  },
  bullet: {
    width: 10,
    textAlign: 'center',
  },
  bulletText: {
    flex: 1,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillCategory: {
    width: '30%',
    marginBottom: 10,
  },
  skillTitle: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  skillList: {
    color: '#333',
  },
});

// Resume PDF Document Component
const ResumePDF = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{formData.basics.name}</Text>
        <Text style={styles.headline}>{formData.basics.headline}</Text>
        <View style={styles.contactRow}>
          <Text>{formData.basics.location?.city}, {formData.basics.location?.country}</Text>
          <Text>{formData.basics.phone}</Text>
          <Text>{formData.basics.email}</Text>
          <Text>{formData.basics.url?.href}</Text>
        </View>
      </View>

      {/* Profiles Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profiles</Text>
        <View style={styles.profileRow}>
          {formData.basics.profiles?.map((profile, index) => (
            <Text key={index}>
              {profile.network}: {profile.username}
            </Text>
          ))}
        </View>
      </View>

      {/* Summary Section */}
      {formData.sections.summary?.content && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text>{formData.sections.summary.content}</Text>
        </View>
      )}

      {/* Experience Section */}
      {formData.sections.experience?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {formData.sections.experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <View>
                  <Text style={styles.companyName}>{exp.company}</Text>
                  <Text style={styles.position}>{exp.position}</Text>
                </View>
                <View>
                  <Text style={styles.location}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                  <Text style={styles.location}>{exp.location}</Text>
                </View>
              </View>
              {exp.highlights?.map((highlight, idx) => (
                <View key={idx} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{highlight}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Projects Section */}
      {formData.sections.projects?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {formData.sections.projects.map((project, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <Text style={styles.companyName}>{project.name}</Text>
                <Text>{project.date}</Text>
              </View>
              <Text>{project.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills Section */}
      {formData.sections.skills?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsGrid}>
            <View style={styles.skillCategory}>
              <Text style={styles.skillTitle}>Web Technologies</Text>
              <Text style={styles.skillList}>
                {formData.sections.skills
                  .filter(skill => skill.category === 'Web Technologies')
                  .map(skill => skill.name)
                  .join(', ')}
              </Text>
            </View>
            <View style={styles.skillCategory}>
              <Text style={styles.skillTitle}>Web Frameworks</Text>
              <Text style={styles.skillList}>
                {formData.sections.skills
                  .filter(skill => skill.category === 'Web Frameworks')
                  .map(skill => skill.name)
                  .join(', ')}
              </Text>
            </View>
            <View style={styles.skillCategory}>
              <Text style={styles.skillTitle}>Tools</Text>
              <Text style={styles.skillList}>
                {formData.sections.skills
                  .filter(skill => skill.category === 'Tools')
                  .map(skill => skill.name)
                  .join(', ')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Education Section */}
      {formData.sections.education?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {formData.sections.education.map((edu, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <View>
                  <Text style={styles.companyName}>{edu.institution}</Text>
                  <Text>{edu.area}</Text>
                </View>
                <Text>{edu.date}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Languages Section */}
      {formData.sections.languages?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          {formData.sections.languages.map((lang, index) => (
            <Text key={index}>
              {lang.name} - {lang.level}
            </Text>
          ))}
        </View>
      )}

      {/* References Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>References</Text>
        <Text>Available upon request</Text>
      </View>
    </Page>
  </Document>
);

// Resume Preview Component with matching styling
const ResumeTemplate = ({ formData }) => {
  return (
    <div className="mb-6">
      <div className="bg-white p-8 shadow-lg">
        {/* Preview content matching PDF layout */}
        {/* ... Similar structure to PDF component but with HTML/CSS ... */}
      </div>

      {/* Download Button */}
      <div className="flex justify-end mt-4">
        <PDFDownloadLink
          document={<ResumePDF formData={formData} />}
          fileName={`${formData.basics.name.replace(/\s+/g, '_')}_Resume.pdf`}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {({ blob, url, loading, error }) =>
            loading ? 'Generating PDF...' : 'Download Resume PDF'
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default ResumeTemplate; 
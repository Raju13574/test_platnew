import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import { userService } from '../../services/user.service';
import { toast } from 'react-hot-toast';
import ResumeTemplate from '../resume/ResumeTemplate';

const Profile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    basics: {
      name: '',
      headline: '',
      email: '',
      phone: '',
      location: {
        address: '',
        city: '',
        country: '',
        postalCode: ''
      },
      url: {
        label: '',
        href: ''
      },
      customFields: []
    },
    sections: {
      summary: {
        visible: true,
        content: '',
        columns: 1
      },
      experience: [],
      education: [],
      skills: [],
      languages: [],
      interests: [],
      publications: [],
      awards: [],
      volunteerWork: [],
      references: [],
      custom: {}
    },
    resumePreferences: {
      template: 'modern',
      layout: {
        columns: 2,
        spacing: 'normal'
      },
      typography: {
        fontSize: 'medium',
        fontFamily: 'Inter'
      }
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);
      setFormData(data);
    } catch (error) {
      setError(error.message);
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    if (keys.length === 2) {
      setFormData({
        ...formData,
        basics: {
          ...formData.basics,
          [keys[1]]: value
        }
      });
    } else if (keys.length === 3) {
      setFormData({
        ...formData,
        basics: {
          ...formData.basics,
          [keys[1]]: {
            ...formData.basics[keys[1]],
            [keys[2]]: value
          }
        }
      });
    }
  };

  const handleSectionChange = (sectionKey, index, field, value) => {
    const sections = { ...formData.sections };
    if (Array.isArray(sections[sectionKey])) {
      sections[sectionKey] = sections[sectionKey].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      );
    } else {
      sections[sectionKey] = { ...sections[sectionKey], [field]: value };
    }
    setFormData({ ...formData, sections });
  };

  const addSectionItem = (sectionKey, template) => {
    const sections = { ...formData.sections };
    sections[sectionKey] = [...(sections[sectionKey] || []), { ...template }];
    setFormData({ ...formData, sections });
  };

  const removeSectionItem = (sectionKey, index) => {
    const sections = { ...formData.sections };
    sections[sectionKey] = sections[sectionKey].filter((_, i) => i !== index);
    setFormData({ ...formData, sections });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userService.updateProfile(formData);
      setIsEditing(false);
      await loadProfile(); // Refresh profile data
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderViewMode = () => {
    if (!profile) return null;

    return (
      <div className="mt-6 space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{profile.basics.name}</h2>
              <p className="text-gray-600 mt-1">{profile.basics.headline}</p>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {profile.basics.email}
                </p>
                {profile.basics.phone && (
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {profile.basics.phone}
                  </p>
                )}
                {(profile.basics.location?.city || profile.basics.location?.country) && (
                  <p className="text-gray-600">
                    <span className="font-medium">Location:</span>{' '}
                    {[
                      profile.basics.location.address,
                      profile.basics.location.city,
                      profile.basics.location.country,
                      profile.basics.location.postalCode
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {profile.sections.summary?.visible && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.sections.summary.content}</p>
          </div>
        )}

        {/* Experience Section */}
        {profile.sections.experience?.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Experience</h3>
            <div className="space-y-6">
              {profile.sections.experience.map((exp, index) => (
                <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium">{exp.position}</h4>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-gray-500 text-sm">{exp.location}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(exp.startDate).toLocaleDateString()} - 
                      {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{exp.summary}</p>
                  {exp.highlights?.length > 0 && (
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      {exp.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-gray-700">{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {profile.sections.education?.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Education</h3>
            <div className="space-y-4">
              {profile.sections.education.map((edu, index) => (
                <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                  <h4 className="text-lg font-medium">{edu.institution}</h4>
                  <p className="text-gray-600">{edu.area} - {edu.studyType}</p>
                  <p className="text-gray-500">{edu.date}</p>
                  {edu.score && <p className="text-gray-600 mt-1">Score: {edu.score}</p>}
                  {edu.activities?.length > 0 && (
                    <ul className="mt-2 list-disc list-inside">
                      {edu.activities.map((activity, idx) => (
                        <li key={idx} className="text-gray-700">{activity}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {profile.sections.skills?.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.sections.skills.map((skill, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium">{skill.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{skill.description}</p>
                  {skill.keywords?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skill.keywords.map((keyword, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Section */}
        {profile.sections.languages?.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Languages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.sections.languages.map((lang, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{lang.name}</h4>
                    <p className="text-gray-600 text-sm">{lang.description}</p>
                  </div>
                  <span className="text-gray-500 capitalize">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteer Work Section */}
        {profile.sections.volunteer?.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Volunteer Work</h3>
            <div className="space-y-6">
              {profile.sections.volunteer.map((vol, index) => (
                <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium">{vol.position}</h4>
                      <p className="text-gray-600">{vol.organization}</p>
                      <p className="text-gray-500 text-sm">{vol.location}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(vol.startDate).toLocaleDateString()} - 
                      {vol.current ? 'Present' : new Date(vol.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{vol.summary}</p>
                  {vol.highlights?.length > 0 && (
                    <ul className="mt-2 list-disc list-inside">
                      {vol.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-gray-700">{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Sections */}
        {Object.entries(profile.sections.custom || {}).map(([sectionId, section]) => (
          section.visible && (
            <div key={sectionId} className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">{section.name}</h3>
              <div className="space-y-4">
                {section.items.map((item, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <h4 className="text-lg font-medium">{item.name}</h4>
                    <p className="text-gray-600">{item.description}</p>
                    {item.date && <p className="text-gray-500 text-sm">{item.date}</p>}
                    {item.summary && <p className="mt-2 text-gray-700">{item.summary}</p>}
                    {item.keywords?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.keywords.map((keyword, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Add Resume Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Resume</h2>
          <ResumeTemplate formData={formData} />
        </div>
      </div>
    );
  };

  const renderEditMode = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="basics.name"
                value={formData.basics.name}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Headline</label>
              <input
                type="text"
                name="basics.headline"
                value={formData.basics.headline}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="basics.email"
                value={formData.basics.email}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="basics.phone"
                value={formData.basics.phone}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Portfolio</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Label</label>
                  <input
                    type="text"
                    name="basics.url.label"
                    value={formData.basics.url.label}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="url"
                    name="basics.url.href"
                    value={formData.basics.url.href}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Custom Fields</label>
              {formData.basics.customFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <input
                      type="url"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addCustomField}
                className="mt-2 text-blue-500 hover:text-blue-700"
              >
                + Add Social Link
              </button>
            </div>
            <div className="col-span-2">
              <h4 className="text-lg font-medium mb-2">Location</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="basics.location.address"
                    value={formData.basics.location.address}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="basics.location.city"
                    value={formData.basics.location.city}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    name="basics.location.country"
                    value={formData.basics.location.country}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    name="basics.location.postalCode"
                    value={formData.basics.location.postalCode}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
          <div>
            <textarea
              name="sections.summary.content"
              value={formData.sections.summary.content}
              onChange={(e) => handleSectionChange('summary', null, 'content', e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sections.summary.visible}
                  onChange={(e) => handleSectionChange('summary', null, 'visible', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="ml-2">Show in resume</span>
              </label>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Experience</h3>
            <button
              type="button"
              onClick={() => addSectionItem('experience', {
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                summary: '',
                highlights: [],
                visible: true
              })}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Experience
            </button>
          </div>
          
          {formData.sections.experience.map((exp, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleSectionChange('experience', index, 'company', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleSectionChange('experience', index, 'position', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => handleSectionChange('experience', index, 'location', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={exp.startDate?.split('T')[0]}
                      onChange={(e) => handleSectionChange('experience', index, 'startDate', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={exp.endDate?.split('T')[0]}
                      onChange={(e) => handleSectionChange('experience', index, 'endDate', e.target.value)}
                      disabled={exp.current}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => handleSectionChange('experience', index, 'current', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2">Current Position</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Summary</label>
                  <textarea
                    value={exp.summary}
                    onChange={(e) => handleSectionChange('experience', index, 'summary', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Highlights</label>
                  {exp.highlights?.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => {
                          const newHighlights = [...exp.highlights];
                          newHighlights[hIndex] = e.target.value;
                          handleSectionChange('experience', index, 'highlights', newHighlights);
                        }}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newHighlights = exp.highlights.filter((_, i) => i !== hIndex);
                          handleSectionChange('experience', index, 'highlights', newHighlights);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newHighlights = [...(exp.highlights || []), ''];
                      handleSectionChange('experience', index, 'highlights', newHighlights);
                    }}
                    className="mt-2 text-blue-500 hover:text-blue-600"
                  >
                    Add Highlight
                  </button>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeSectionItem('experience', index)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove Experience
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Skills</h3>
            <button
              type="button"
              onClick={() => addSectionItem('skills', {
                name: '',
                level: 'intermediate',
                keywords: [],
                description: '',
                visible: true
              })}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Skill
            </button>
          </div>
          
          {formData.sections.skills.map((skill, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skill Name</label>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => handleSectionChange('skills', index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <select
                    value={skill.level}
                    onChange={(e) => handleSectionChange('skills', index, 'level', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={skill.description}
                    onChange={(e) => handleSectionChange('skills', index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Keywords</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skill.keywords?.map((keyword, kIndex) => (
                      <div key={kIndex} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                        <span>{keyword}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newKeywords = skill.keywords.filter((_, i) => i !== kIndex);
                            handleSectionChange('skills', index, 'keywords', newKeywords);
                          }}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Add keyword"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const newKeywords = [...(skill.keywords || []), e.target.value];
                          handleSectionChange('skills', index, 'keywords', newKeywords);
                          e.target.value = '';
                        }
                      }}
                      className="border rounded-full px-3 py-1"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeSectionItem('skills', index)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove Skill
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resume Preferences */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Resume Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <select
                name="resumePreferences.template"
                value={formData.resumePreferences.template}
                onChange={(e) => handleResumePreferencesChange('template', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Font Size</label>
              <select
                name="resumePreferences.typography.fontSize"
                value={formData.resumePreferences.typography.fontSize}
                onChange={(e) => handleResumePreferencesChange('typography.fontSize', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Layout Columns</label>
              <select
                value={formData.resumePreferences.layout.columns}
                onChange={(e) => handleResumePreferencesChange('layout.columns', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value={1}>Single Column</option>
                <option value={2}>Two Columns</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Spacing</label>
              <select
                value={formData.resumePreferences.layout.spacing}
                onChange={(e) => handleResumePreferencesChange('layout.spacing', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </div>
        </div>

        {/* Languages Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Languages</h3>
            <button
              type="button"
              onClick={() => addSectionItem('languages', {
                name: '',
                level: 'beginner',
                description: '',
                visible: true
              })}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Language
            </button>
          </div>
          {formData.sections.languages.map((lang, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => handleSectionChange('languages', index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Proficiency Level</label>
                  <select
                    value={lang.level}
                    onChange={(e) => handleSectionChange('languages', index, 'level', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="native">Native</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={lang.description}
                    onChange={(e) => handleSectionChange('languages', index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSectionItem('languages', index)}
                className="mt-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Publications Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Publications</h3>
            <button
              type="button"
              onClick={() => addSectionItem('publications', {
                name: '',
                publisher: '',
                date: '',
                url: { label: '', href: '' },
                summary: '',
                visible: true
              })}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Publication
            </button>
          </div>
          {formData.sections.publications.map((pub, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={pub.name}
                    onChange={(e) => handleSectionChange('publications', index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Publisher</label>
                  <input
                    type="text"
                    value={pub.publisher}
                    onChange={(e) => handleSectionChange('publications', index, 'publisher', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={pub.date?.split('T')[0]}
                    onChange={(e) => handleSectionChange('publications', index, 'date', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="url"
                    value={pub.url?.href}
                    onChange={(e) => handleSectionChange('publications', index, 'url.href', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Summary</label>
                  <textarea
                    value={pub.summary}
                    onChange={(e) => handleSectionChange('publications', index, 'summary', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSectionItem('publications', index)}
                className="mt-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Interests Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Interests</h3>
            <button
              type="button"
              onClick={() => addSectionItem('interests', {
                name: '',
                keywords: [],
                visible: true
              })}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Interest
            </button>
          </div>
          {formData.sections.interests.map((interest, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest Name</label>
                  <input
                    type="text"
                    value={interest.name}
                    onChange={(e) => handleSectionChange('interests', index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={interest.keywords?.join(', ')}
                    onChange={(e) => handleSectionChange('interests', index, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSectionItem('interests', index)}
                className="mt-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* References Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">References</h3>
            <button
              type="button"
              onClick={() => addSectionItem('references', {
                name: '',
                description: '',
                url: { label: '', href: '' },
                summary: '',
                visible: true
              })}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Reference
            </button>
          </div>
          {formData.sections.references.map((ref, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={ref.name}
                    onChange={(e) => handleSectionChange('references', index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title/Position</label>
                  <input
                    type="text"
                    value={ref.description}
                    onChange={(e) => handleSectionChange('references', index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                  <input
                    type="url"
                    value={ref.url?.href}
                    onChange={(e) => handleSectionChange('references', index, 'url.href', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Summary</label>
                  <textarea
                    value={ref.summary}
                    onChange={(e) => handleSectionChange('references', index, 'summary', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSectionItem('references', index)}
                className="mt-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Volunteer Work Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Volunteer Work</h3>
            <button
              type="button"
              onClick={() => addSectionItem('volunteer', {
                organization: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                summary: '',
                highlights: [],
                visible: true
              })}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Volunteer Work
            </button>
          </div>
          {formData.sections.volunteer.map((vol, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization</label>
                  <input
                    type="text"
                    value={vol.organization}
                    onChange={(e) => handleSectionChange('volunteer', index, 'organization', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={vol.position}
                    onChange={(e) => handleSectionChange('volunteer', index, 'position', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={vol.location}
                    onChange={(e) => handleSectionChange('volunteer', index, 'location', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={vol.startDate?.split('T')[0]}
                      onChange={(e) => handleSectionChange('volunteer', index, 'startDate', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={vol.endDate?.split('T')[0]}
                      onChange={(e) => handleSectionChange('volunteer', index, 'endDate', e.target.value)}
                      disabled={vol.current}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={vol.current}
                      onChange={(e) => handleSectionChange('volunteer', index, 'current', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2">Current Position</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Summary</label>
                  <textarea
                    value={vol.summary}
                    onChange={(e) => handleSectionChange('volunteer', index, 'summary', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                {/* Highlights */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Highlights</label>
                  {vol.highlights?.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => {
                          const newHighlights = [...vol.highlights];
                          newHighlights[hIndex] = e.target.value;
                          handleSectionChange('volunteer', index, 'highlights', newHighlights);
                        }}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newHighlights = vol.highlights.filter((_, i) => i !== hIndex);
                          handleSectionChange('volunteer', index, 'highlights', newHighlights);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newHighlights = [...(vol.highlights || []), ''];
                      handleSectionChange('volunteer', index, 'highlights', newHighlights);
                    }}
                    className="mt-2 text-blue-500 hover:text-blue-700"
                  >
                    + Add Highlight
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSectionItem('volunteer', index)}
                className="mt-4 text-red-500 hover:text-red-700"
              >
                Remove Volunteer Work
              </button>
            </div>
          ))}
        </div>

        {/* Awards Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Awards</h3>
            <button
              type="button"
              onClick={() => addSectionItem('awards', {
                title: '',
                awarder: '',
                date: '',
                url: { label: '', href: '' },
                summary: '',
                visible: true
              })}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Award
            </button>
          </div>
          {formData.sections.awards.map((award, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={award.title}
                    onChange={(e) => handleSectionChange('awards', index, 'title', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Awarder</label>
                  <input
                    type="text"
                    value={award.awarder}
                    onChange={(e) => handleSectionChange('awards', index, 'awarder', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={award.date?.split('T')[0]}
                    onChange={(e) => handleSectionChange('awards', index, 'date', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="url"
                    value={award.url?.href}
                    onChange={(e) => handleSectionChange('awards', index, 'url.href', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Summary</label>
                  <textarea
                    value={award.summary}
                    onChange={(e) => handleSectionChange('awards', index, 'summary', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSectionItem('awards', index)}
                className="mt-4 text-red-500 hover:text-red-700"
              >
                Remove Award
              </button>
            </div>
          ))}
        </div>

        {/* Custom Sections */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Custom Sections</h3>
            <button
              type="button"
              onClick={() => {
                const newSectionId = `custom-${Date.now()}`;
                const newSection = {
                  name: '',
                  items: [],
                  visible: true
                };
                setFormData({
                  ...formData,
                  sections: {
                    ...formData.sections,
                    custom: {
                      ...formData.sections.custom,
                      [newSectionId]: newSection
                    }
                  }
                });
              }}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Custom Section
            </button>
          </div>
          {Object.entries(formData.sections.custom).map(([sectionId, section]) => (
            <div key={sectionId} className="mb-6 p-4 border rounded">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Section Name</label>
                <input
                  type="text"
                  value={section.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      sections: {
                        ...formData.sections,
                        custom: {
                          ...formData.sections.custom,
                          [sectionId]: {
                            ...section,
                            name: e.target.value
                          }
                        }
                      }
                    });
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              
              {/* Custom Section Items */}
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="mb-4 p-4 border rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...section.items];
                          newItems[itemIndex] = { ...item, name: e.target.value };
                          setFormData({
                            ...formData,
                            sections: {
                              ...formData.sections,
                              custom: {
                                ...formData.sections.custom,
                                [sectionId]: {
                                  ...section,
                                  items: newItems
                                }
                              }
                            }
                          });
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...section.items];
                          newItems[itemIndex] = { ...item, description: e.target.value };
                          setFormData({
                            ...formData,
                            sections: {
                              ...formData.sections,
                              custom: {
                                ...formData.sections.custom,
                                [sectionId]: {
                                  ...section,
                                  items: newItems
                                }
                              }
                            }
                          });
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = section.items.filter((_, i) => i !== itemIndex);
                      setFormData({
                        ...formData,
                        sections: {
                          ...formData.sections,
                          custom: {
                            ...formData.sections.custom,
                            [sectionId]: {
                              ...section,
                              items: newItems
                            }
                          }
                        }
                      });
                    }}
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    Remove Item
                  </button>
                </div>
              ))}
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const newItem = {
                      id: `item-${Date.now()}`,
                      name: '',
                      description: '',
                      visible: true
                    };
                    setFormData({
                      ...formData,
                      sections: {
                        ...formData.sections,
                        custom: {
                          ...formData.sections.custom,
                          [sectionId]: {
                            ...section,
                            items: [...section.items, newItem]
                          }
                        }
                      }
                    });
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  + Add Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { [sectionId]: _, ...remainingSections } = formData.sections.custom;
                    setFormData({
                      ...formData,
                      sections: {
                        ...formData.sections,
                        custom: remainingSections
                      }
                    });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove Section
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    );
  };

  // Add these new handler functions
  const handleResumePreferencesChange = (key, value) => {
    const keys = key.split('.');
    if (keys.length === 1) {
      setFormData({
        ...formData,
        resumePreferences: {
          ...formData.resumePreferences,
          [key]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        resumePreferences: {
          ...formData.resumePreferences,
          [keys[0]]: {
            ...formData.resumePreferences[keys[0]],
            [keys[1]]: value
          }
        }
      });
    }
  };

  // Handler functions for custom fields
  const handleCustomFieldChange = (index, field, value) => {
    const updatedCustomFields = [...formData.basics.customFields];
    updatedCustomFields[index] = {
      ...updatedCustomFields[index],
      [field]: value
    };
    setFormData({
      ...formData,
      basics: {
        ...formData.basics,
        customFields: updatedCustomFields
      }
    });
  };

  const addCustomField = () => {
    const newCustomField = {
      id: `custom-${Date.now()}`,
      name: '',
      value: '',
      icon: ''
    };
    setFormData({
      ...formData,
      basics: {
        ...formData.basics,
        customFields: [...formData.basics.customFields, newCustomField]
      }
    });
  };

  const removeCustomField = (index) => {
    const updatedCustomFields = formData.basics.customFields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      basics: {
        ...formData.basics,
        customFields: updatedCustomFields
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={loadProfile}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : ''} transition-margin duration-200 overflow-y-auto`}>
        <div className="p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : isEditing ? (
            renderEditMode()
          ) : (
            renderViewMode()
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
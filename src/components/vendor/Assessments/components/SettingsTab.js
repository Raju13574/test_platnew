import React from 'react';
// import { toast } from 'react-hot-toast';
// import { testService } from '../../../../services/test.service';

const SettingsTab = ({ testData, setTestData, testId }) => {
  return (
    <div className="space-y-6">
      {/* Commenting out Time Management
      <Card>
        <CardHeader className="border-b p-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-500" />
            Time Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Maximum Duration (minutes)</label>
              <input
                type="number"
                value={testData.duration}
                onChange={(e) => setTestData({ ...testData, duration: e.target.value })}
                className="w-full p-2 border rounded-lg"
                min="1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="timePerQuestion"
                checked={testData.settings?.timing?.timePerQuestion}
                onChange={(e) => handleSettingUpdate('timing', 'timePerQuestion', e.target.checked)}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="timePerQuestion" className="text-sm">Set time limit per question</label>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Commenting out Access Control
      <Card>
        <CardHeader className="border-b p-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Test Access</label>
              <select
                value={testData.settings?.access?.type}
                onChange={(e) => handleSettingUpdate('access', 'type', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="private">Private (Invitation Only)</option>
                <option value="public">Public</option>
                <option value="domain">Domain Restricted</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requireRegistration"
                checked={testData.settings?.access?.requireRegistration}
                onChange={(e) => handleSettingUpdate('access', 'requireRegistration', e.target.checked)}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="requireRegistration" className="text-sm">Require pre-registration</label>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Commenting out Result Settings
      <Card>
        <CardHeader className="border-b p-4">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-500" />
            Result Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showResults"
                checked={testData.settings?.results?.showResults}
                onChange={(e) => handleSettingUpdate('results', 'showResults', e.target.checked)}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="showResults" className="text-sm">Show results immediately</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showAnswers"
                checked={testData.settings?.results?.showAnswers}
                onChange={(e) => handleSettingUpdate('results', 'showAnswers', e.target.checked)}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="showAnswers" className="text-sm">Show correct answers</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowReview"
                checked={testData.settings?.results?.allowReview}
                onChange={(e) => handleSettingUpdate('results', 'allowReview', e.target.checked)}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="allowReview" className="text-sm">Allow answer review</label>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Commenting out Advanced Settings
      <Card>
        <CardHeader className="border-b p-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-500" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="randomizeQuestions"
                checked={testData.settings?.advanced?.randomizeQuestions}
                onChange={(e) => handleSettingUpdate('advanced', 'randomizeQuestions', e.target.checked)}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="randomizeQuestions" className="text-sm">Randomize question order</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="preventCopy"
                checked={testData.settings?.advanced?.preventCopy}
                onChange={(e) => handleSettingUpdate('advanced', 'preventCopy', e.target.checked)}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="preventCopy" className="text-sm">Prevent copy/paste</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="negativeMarking"
                checked={testData.settings?.advanced?.negativeMarking}
                onChange={(e) => handleSettingUpdate('advanced', 'negativeMarking', e.target.checked)}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="negativeMarking" className="text-sm">Enable negative marking</label>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Commenting out Warning System Settings
      <Card>
        <CardHeader className="border-b p-4">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-emerald-500" />
            Warning System
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable Warning System</h4>
                <p className="text-sm text-gray-500">Monitor and warn candidates for suspicious behavior</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={testData.warningSystem?.enabled}
                  onChange={(e) => setTestData({
                    ...testData,
                    warningSystem: {
                      ...testData.warningSystem,
                      enabled: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Commenting out Test Scheduling
      <Card>
        <CardHeader className="border-b p-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-500" />
            Test Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={testData.scheduling?.startDate || ''}
                  onChange={(e) => setTestData({
                    ...testData,
                    scheduling: {
                      ...testData.scheduling,
                      startDate: e.target.value
                    }
                  })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={testData.scheduling?.endDate || ''}
                  onChange={(e) => setTestData({
                    ...testData,
                    scheduling: {
                      ...testData.scheduling,
                      endDate: e.target.value
                    }
                  })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoStart"
                checked={testData.scheduling?.autoStart}
                onChange={(e) => setTestData({
                  ...testData,
                  scheduling: {
                    ...testData.scheduling,
                    autoStart: e.target.checked
                  }
                })}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="autoStart" className="text-sm">Auto-start test at start date</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoEnd"
                checked={testData.scheduling?.autoEnd}
                onChange={(e) => setTestData({
                  ...testData,
                  scheduling: {
                    ...testData.scheduling,
                    autoEnd: e.target.checked
                  }
                })}
                className="h-4 w-4 text-emerald-500 rounded border-gray-300"
              />
              <label htmlFor="autoEnd" className="text-sm">Auto-end test at end date</label>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Commenting out Submission Limits
      <Card>
        <CardHeader className="border-b p-4">
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-emerald-500" />
            Submission Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Allow Retakes</h4>
                <p className="text-sm text-gray-500">Let candidates retake the test</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={testData.submissionLimits?.allowRetake}
                  onChange={(e) => setTestData({
                    ...testData,
                    submissionLimits: {
                      ...testData.submissionLimits,
                      allowRetake: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  );
};

export default SettingsTab; 
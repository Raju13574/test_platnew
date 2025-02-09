import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const ImageUpload = ({ onUpload, maxSize = 5 }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    try {
      setLoading(true);
      
      // Add your image upload logic here
      // This should integrate with your backend storage solution
      const uploadedUrl = await uploadImage(file);
      
      onUpload(uploadedUrl);
      message.success('Image uploaded successfully');
    } catch (error) {
      message.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Upload.Dragger
      accept="image/*"
      beforeUpload={(file) => {
        if (file.size > maxSize * 1024 * 1024) {
          message.error(`Image must be smaller than ${maxSize}MB`);
          return false;
        }
        handleUpload(file);
        return false;
      }}
      showUploadList={false}
      disabled={loading}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        Click or drag image to upload
      </p>
    </Upload.Dragger>
  );
};

export default ImageUpload; 
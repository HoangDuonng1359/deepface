import React, { useState } from 'react';
import { Card, Spin, Typography } from 'antd';
import { Upload, RotateCcw } from 'lucide-react';

const { Title } = Typography;

const DeepFacePage: React.FC = () => {
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [samePerson, setSamePerson] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>, which: 'image1' | 'image2') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result as string;
      if (which === 'image1') {
        setImage1(result);
        setAge(null);
        setEmotion(null);
      } else {
        setImage2(result);
        setSamePerson(null);
      }
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePredictAge = async () => {
    if (!image1) {
      setError('Please upload an image first');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/predict_age', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: image1 }), // `image1` là base64 string
      });
  
      const data = await response.json();  // Không dùng no-cors để response đọc được
      if (data.age !== undefined) {
        setAge(data.age);
        setError(null);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      setError('Error predicting age');
    } finally {
      setLoading(false);
    }
  };
  
  

  const handlePredictEmotion = async () => {
    if (!image1) {
      setError('Please upload an image first');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/predict_emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: image1 }), // `image1` là base64 string
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch emotion prediction');
      }
  
      const data = await response.json();
      if (data.emotion) {
        setEmotion(data.emotion);
        setError(null);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      setError('Error predicting emotion');
    } finally {
      setLoading(false);
    }
  };
  

  const handleVerify = async () => {
    if (!image1 || !image2) {
      setError('Please upload both images first');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image1, image2 }), // image1, image2 là base64 strings
      });
  
      if (!response.ok) {
        throw new Error('Failed to verify faces');
      }
  
      const data = await response.json();
      if (data.same_person !== undefined) {
        setSamePerson(data.same_person);
        setError(null);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      setError('Error comparing faces');
    } finally {
      setLoading(false);
    }
  };
  

  const resetAll = () => {
    setImage1(null);
    setImage2(null);
    setAge(null);
    setEmotion(null);
    setSamePerson(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <Title level={2}>DeepFace Demo</Title>

      <Card className="w-full max-w-3xl shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="font-semibold">Image 1 (Age / Emotion / Comparison)</p>
            <div className="flex items-center space-x-2">
              <label className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded cursor-pointer flex items-center">
                <Upload size={16} className="mr-1" />
                <span>Upload Image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileInputChange(e, 'image1')}
                />
              </label>
            </div>
            {image1 && (
              <div className="mt-2 rounded-md overflow-hidden border border-gray-300">
                <img src={image1} alt="Image 1" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="font-semibold">Image 2 (Only for comparison)</p>
            <div className="flex items-center space-x-2">
              <label className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded cursor-pointer flex items-center">
                <Upload size={16} className="mr-1" />
                <span>Upload Image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileInputChange(e, 'image2')}
                />
              </label>
            </div>
            {image2 && (
              <div className="mt-2 rounded-md overflow-hidden border border-gray-300">
                <img src={image2} alt="Image 2" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={handlePredictAge}
            disabled={loading}
          >
            Predict Age
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={handlePredictEmotion}
            disabled={loading}
          >
            Predict Emotion
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={handleVerify}
            disabled={loading}
          >
            Compare Faces
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center"
            onClick={resetAll}
          >
            <RotateCcw size={16} className="mr-1" />
            Reset
          </button>
        </div>

        <Spin spinning={loading}>
          <div className="text-center space-y-2 mt-6">
            {age !== null && <p className="text-lg">👶 Estimated Age: <span className="font-bold">{age}</span></p>}
            {emotion !== null && <p className="text-lg">😊 Emotion: <span className="font-bold">{emotion}</span></p>}
            {samePerson !== null && (
              <p className="text-lg">
                🔍 Comparison Result:{" "}
                <span className={samePerson ? "font-bold text-green-600" : "font-bold text-red-600"}>
                  {samePerson ? "Same Person" : "Different Person"}
                </span>
              </p>
            )}
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default DeepFacePage;
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Paintbrush, FileImage, Send, CheckCircle, X } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import supabase from '@/lib/supabase';

export default function CustomDesignForm() {
  const t = useTranslations('custom_design');
  const locale = useLocale();
  const addCustomRequest = useStore((state) => state.addCustomRequest);

  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Anime');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const topics = [
    'Games', 'Movies', 'TV Shows', 'Singers', 'Football Clubs', 'Anime', 'Personal Art', 'Memes', 'Original Idea'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !instagram || !description) return;

    setIsSubmitting(true);

    // Attempt to automatically create the bucket to avoid "bucket not found" error
    try {
      await supabase.storage.createBucket('products', { public: true });
    } catch (err) {
      // Ignore
    }

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `custom/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data, error } = await supabase.storage.from('products').upload(fileName, file);
      if (error) {
        console.error('Reference image upload error:', error);
        continue;
      }
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
        uploadedUrls.push(publicUrl);
      }
    }

    const success = await addCustomRequest({
      customer_name: name,
      instagram_username: instagram,
      description: `[Topic: ${selectedTopic}] ${description}`,
      reference_images: uploadedUrls
    });
    setIsSubmitting(false);

    if (success) {
      setShowSuccess(true);
    }
  };

  const getInstagramDMUrl = () => {
    const text = encodeURIComponent(
      t('dm_text_template', { name, username: instagram, desc: description })
    );
    return `https://www.instagram.com/fandom.__.fit?igsh=cG9udzFxcjg5MGZv&text=${text}`;
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setName('');
    setInstagram('');
    setDescription('');
    setFiles([]);
    setFilePreviews([]);
  };

  return (
    <section id="custom-design" className="py-24 bg-[#EDE0D0] border-b-4 border-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Overlapping tapes */}
        <div className="absolute top-[5%] left-[10%] px-6 py-1.5 masking-tape rotate-[-2deg] z-10 text-xs hidden md:block">
          ✂️ DESIGN LAB
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Info Side */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left rtl:lg:text-right">
            <div className="p-4 bg-[#F2CC8F] border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] inline-block mb-6">
              <Paintbrush size={36} className="text-black" />
            </div>
            
            <h2 className="text-5xl font-black uppercase tracking-tight text-black leading-tight">
              {t('title')}
            </h2>
            
            <p className="mt-4 text-lg font-semibold text-black/75 font-handwriting">
              {t('subtitle')}
            </p>

            <p className="mt-6 text-sm font-semibold text-black/60 leading-relaxed max-w-md">
              {t('intro_text')}
            </p>

            <div className="mt-6 p-4 border-2 border-dashed border-black/40 rounded-xl max-w-md bg-white/30 text-xs font-bold uppercase tracking-wider text-black/75">
              💡 {t('support_types')}
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 select-none">
            <div className="bg-white border-3 border-black p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[1deg] relative">
              <div className="absolute -top-3 left-[20%] w-24 h-6 bg-[#81B29A]/85 border-2 border-black/35 rotate-[-5deg]"></div>
              
              <h3 className="text-2xl font-black uppercase text-black mb-6">
                {t('form_title')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Topic selector */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-2">
                    Fandom Topic
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {topics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSelectedTopic(topic)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                          selectedTopic === topic
                            ? 'bg-black text-[#EDE0D0] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-1px]'
                            : 'bg-[#EDE0D0]/20 text-black hover:bg-black/5'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-1.5">
                    {t('name_label')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('name_placeholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#EDE0D0]/10 text-black font-semibold border-2 border-black rounded-xl focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Instagram Handle */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-1.5">
                    {t('insta_label')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('insta_placeholder')}
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-4 py-3 bg-[#EDE0D0]/10 text-black font-semibold border-2 border-black rounded-xl focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Idea description */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-1.5">
                    {t('desc_label')}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={t('desc_placeholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-[#EDE0D0]/10 text-black font-semibold border-2 border-black rounded-xl focus:outline-none focus:bg-white resize-none"
                  />
                </div>

                {/* Reference images upload */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-1.5">
                    {t('images_label')}
                  </label>
                  <label htmlFor="design-files" className="border-2 border-dashed border-black/35 rounded-xl p-4 bg-[#EDE0D0]/10 text-center hover:bg-black/5 cursor-pointer flex flex-col items-center block">
                    <FileImage className="text-black/55 mb-2" size={24} />
                    <span className="text-xs font-bold block">{t('choose_images')}</span>
                    <span className="text-[10px] font-bold text-black/40 block mt-1">{t('images_hint')}</span>
                    <input 
                      type="file" 
                      id="design-files"
                      multiple 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>

                  {filePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 mt-3">
                      {filePreviews.map((preview, idx) => (
                        <div key={idx} className="relative w-16 h-16 border-2 border-black rounded-lg overflow-hidden bg-white/50">
                          <img src={preview} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="absolute top-0.5 right-0.5 bg-red-600 border border-black text-white rounded-full p-0.5 cursor-pointer hover:bg-red-700 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 mt-6 text-sm font-black uppercase bg-black text-white hover:bg-brand-accent border-3 border-black rounded-xl sticker cursor-pointer transition-colors"
                >
                  <Send size={16} />
                  {t('submit_btn')}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseSuccess}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Success Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full relative z-10 text-center"
            >
              <CheckCircle size={56} className="mx-auto text-green-600 mb-4 animate-bounce" />
              
              <h4 className="text-3xl font-black uppercase mb-3">
                {t('success_title')}
              </h4>

              <p className="text-sm font-semibold text-black/70 mb-6 font-handwriting leading-relaxed">
                {t('success_desc')}
              </p>

              {/* Direct Instagram DM Link */}
              <a
                href={getInstagramDMUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCloseSuccess}
                className="w-full flex items-center justify-center gap-2 py-4 mb-3 text-sm font-black uppercase text-white bg-black hover:bg-[#E07A5F] border-3 border-black rounded-xl sticker cursor-pointer transition-colors"
              >
                <InstagramIcon size={18} />
                {t('dm_btn')}
              </a>

              <button
                onClick={handleCloseSuccess}
                className="text-xs uppercase font-extrabold tracking-widest text-black/50 hover:text-black border-b border-black/20"
              >
                Close Window
              </button>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </section>
  );
}

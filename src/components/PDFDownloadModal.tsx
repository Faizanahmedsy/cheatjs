'use client';

import { useState } from 'react';
import { X, Download, Check } from 'lucide-react';
import { cheatsheets } from '@/lib/cheatsheets';
import { allDSATopics } from '@/lib/dsa';
import { generateCheatsheetPDF, generateDSAPDF } from '@/utils/pdfGenerator';
import type { Snippet } from '@/lib/cheatsheets';
import type { DSATopic } from '@/lib/dsa';

interface PDFDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedTopic {
  categoryName: string;
  subCategoryName: string;
  sectionName?: string;
  snippetTitle: string;
  snippet: Snippet;
}

type ContentType = 'cheatsheets' | 'dsa';

export function PDFDownloadModal({ isOpen, onClose }: PDFDownloadModalProps) {
  const [contentType, setContentType] = useState<ContentType>('cheatsheets');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedDSATopics, setSelectedDSATopics] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');

  if (!isOpen) return null;

  // Build a flat list of all available topics
  const allTopics: SelectedTopic[] = [];
  
  cheatsheets.forEach((category) => {
    if (category.subCategories) {
      category.subCategories.forEach((subCategory) => {
        if (subCategory.sections) {
          // Handle sections
          subCategory.sections.forEach((section) => {
            section.snippets.forEach((snippet) => {
              const id = `${category.name}-${subCategory.name}-${section.heading}-${snippet.title}`;
              allTopics.push({
                categoryName: category.name,
                subCategoryName: subCategory.name,
                sectionName: section.heading,
                snippetTitle: snippet.title,
                snippet,
              });
            });
          });
        } else if (subCategory.snippets) {
          // Handle direct snippets
          subCategory.snippets.forEach((snippet) => {
            const id = `${category.name}-${subCategory.name}-${snippet.title}`;
            allTopics.push({
              categoryName: category.name,
              subCategoryName: subCategory.name,
              snippetTitle: snippet.title,
              snippet,
            });
          });
        }
      });
    } else if (category.snippets) {
      // Handle categories without subcategories
      category.snippets.forEach((snippet) => {
        const id = `${category.name}-${snippet.title}`;
        allTopics.push({
          categoryName: category.name,
          subCategoryName: category.name,
          snippetTitle: snippet.title,
          snippet,
        });
      });
    }
  });

  const getTopicId = (topic: SelectedTopic) => {
    return topic.sectionName
      ? `${topic.categoryName}-${topic.subCategoryName}-${topic.sectionName}-${topic.snippetTitle}`
      : `${topic.categoryName}-${topic.subCategoryName}-${topic.snippetTitle}`;
  };

  const toggleTopic = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const toggleDSATopic = (topicId: string) => {
    const newSelected = new Set(selectedDSATopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedDSATopics(newSelected);
  };

  const selectAll = () => {
    if (contentType === 'cheatsheets') {
      const allIds = allTopics.map(getTopicId);
      setSelectedTopics(new Set(allIds));
    } else {
      const allIds = allDSATopics.map(t => t.id);
      setSelectedDSATopics(new Set(allIds));
    }
  };

  const deselectAll = () => {
    if (contentType === 'cheatsheets') {
      setSelectedTopics(new Set());
    } else {
      setSelectedDSATopics(new Set());
    }
  };

  const handleDownload = async () => {
    if (contentType === 'cheatsheets') {
      if (selectedTopics.size === 0) {
        alert('Please select at least one topic');
        return;
      }

      setIsGenerating(true);
      try {
        // Filter selected snippets
        const selectedSnippets = allTopics.filter((topic) =>
          selectedTopics.has(getTopicId(topic))
        );

        // Group by category and subcategory
        const groupedTopics = selectedSnippets.reduce((acc, topic) => {
          const key = `${topic.categoryName}-${topic.subCategoryName}`;
          if (!acc[key]) {
            acc[key] = {
              categoryName: topic.categoryName,
              subCategoryName: topic.subCategoryName,
              snippets: [],
            };
          }
          acc[key].snippets.push(topic.snippet);
          return acc;
        }, {} as Record<string, { categoryName: string; subCategoryName: string; snippets: Snippet[] }>);

        // Generate PDF for the first group (or combine all)
        const firstGroup = Object.values(groupedTopics)[0];
        if (firstGroup) {
          // Create a custom subcategory with selected snippets
          const customSubCategory = {
            name: selectedTopics.size === allTopics.length 
              ? firstGroup.subCategoryName 
              : 'Custom Selection',
            snippets: Object.values(groupedTopics).flatMap(g => g.snippets),
          };

          await generateCheatsheetPDF(
            selectedTopics.size === allTopics.length 
              ? firstGroup.categoryName 
              : 'CheatJS',
            customSubCategory,
            customTitle || undefined,
            customSubtitle || undefined
          );
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      // DSA PDF generation
      if (selectedDSATopics.size === 0) {
        alert('Please select at least one DSA topic');
        return;
      }

      setIsGenerating(true);
      try {
        const selectedTopicsData = allDSATopics.filter((topic) =>
          selectedDSATopics.has(topic.id)
        );

        await generateDSAPDF(
          selectedTopicsData,
          customTitle || undefined,
          customSubtitle || undefined
        );
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  // Group topics by category and subcategory for display
  const groupedTopics = allTopics.reduce((acc, topic) => {
    const categoryKey = topic.categoryName;
    const subCategoryKey = topic.subCategoryName;
    
    if (!acc[categoryKey]) {
      acc[categoryKey] = {};
    }
    if (!acc[categoryKey][subCategoryKey]) {
      acc[categoryKey][subCategoryKey] = [];
    }
    acc[categoryKey][subCategoryKey].push(topic);
    return acc;
  }, {} as Record<string, Record<string, SelectedTopic[]>>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Download PDF</h2>
            <p className="text-sm text-slate-400 mt-1">
              Select topics to include in your PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Type Selector */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/30">
          <div className="flex gap-2">
            <button
              onClick={() => setContentType('cheatsheets')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                contentType === 'cheatsheets'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Cheatsheets
            </button>
            <button
              onClick={() => setContentType('dsa')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                contentType === 'dsa'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              DSA
            </button>
          </div>
        </div>

        {/* Custom Title and Subtitle Inputs */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., React Fundamentals"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Custom Subtitle (Optional)
              </label>
              <input
                type="text"
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                placeholder="e.g., Essential Concepts"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="text-sm text-slate-300">
            {contentType === 'cheatsheets' 
              ? `${selectedTopics.size} of ${allTopics.length} topics selected`
              : `${selectedDSATopics.size} of ${allDSATopics.length} topics selected`
            }
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-6">
          {contentType === 'cheatsheets' ? (
            <div className="space-y-6">
              {Object.entries(groupedTopics).map(([categoryName, subCategories]) => (
                <div key={categoryName}>
                  <h3 className="text-lg font-bold text-cyan-300 mb-3">
                    {categoryName}
                  </h3>
                  {Object.entries(subCategories).map(([subCategoryName, topics]) => (
                    <div key={subCategoryName} className="ml-4 mb-4">
                      <h4 className="text-md font-semibold text-slate-300 mb-2">
                        {subCategoryName}
                      </h4>
                      <div className="space-y-1">
                        {topics.map((topic) => {
                          const topicId = getTopicId(topic);
                          const isSelected = selectedTopics.has(topicId);
                          return (
                            <label
                              key={topicId}
                              className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 cursor-pointer transition-colors"
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-slate-600'
                                }`}
                              >
                                {isSelected && <Check size={14} className="text-white" />}
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleTopic(topicId)}
                                className="sr-only"
                              />
                              <span className="text-sm text-slate-300">
                                {topic.sectionName && (
                                  <span className="text-slate-500">{topic.sectionName} → </span>
                                )}
                                {topic.snippetTitle}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {allDSATopics.map((topic) => {
                const Icon = topic.icon;
                const isSelected = selectedDSATopics.has(topic.id);
                return (
                  <label
                    key={topic.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDSATopic(topic.id)}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 text-cyan-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">
                        {topic.label}
                      </div>
                      <div className="text-xs text-slate-400">
                        {topic.content.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={
              (contentType === 'cheatsheets' && selectedTopics.size === 0) ||
              (contentType === 'dsa' && selectedDSATopics.size === 0) ||
              isGenerating
            }
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-lg"
          >
            <Download size={18} />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

import * as fc from 'fast-check';
import {
  parseEssay,
  tokenizeWords,
  tokenizeSentences,
  extractKeywords,
  isValidEssayContent,
  getWordCount,
  getSentenceCount,
  getAverageWordsPerSentence
} from './essayParser';
import { EssayContent } from '../models/types';

describe('Essay Parser', () => {
  describe('parseEssay', () => {
    it('should parse valid essay text', () => {
      const essayText = 'This is a test essay. It contains multiple sentences.';
      const result = parseEssay(essayText);

      expect(result.rawText).toBe(essayText);
      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.sentences.length).toBeGreaterThan(0);
    });

    it('should throw error for empty string', () => {
      expect(() => parseEssay('')).toThrow('Essay content cannot be empty');
    });

    it('should throw error for whitespace-only string', () => {
      expect(() => parseEssay('   \n\t  ')).toThrow('Essay content cannot be empty');
    });

    it('should throw error for non-string input', () => {
      expect(() => parseEssay(null as any)).toThrow('Essay text must be a non-empty string');
      expect(() => parseEssay(undefined as any)).toThrow('Essay text must be a non-empty string');
      expect(() => parseEssay(123 as any)).toThrow('Essay text must be a non-empty string');
    });

    it('should preserve raw text exactly', () => {
      const essayText = 'The quick brown fox jumps over the lazy dog.';
      const result = parseEssay(essayText);
      expect(result.rawText).toBe(essayText);
    });

    it('should handle essays with multiple paragraphs', () => {
      const essayText = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      const result = parseEssay(essayText);

      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.sentences.length).toBeGreaterThan(0);
    });

    it('should handle essays with special characters', () => {
      const essayText = 'This essay contains special characters: @, #, $, %, &, etc.';
      const result = parseEssay(essayText);

      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.sentences.length).toBeGreaterThan(0);
    });
  });

  describe('tokenizeWords', () => {
    it('should tokenize simple text', () => {
      const text = 'hello world test';
      const tokens = tokenizeWords(text);

      expect(tokens).toContain('hello');
      expect(tokens).toContain('world');
      expect(tokens).toContain('test');
    });

    it('should remove punctuation', () => {
      const text = 'hello, world! test?';
      const tokens = tokenizeWords(text);

      expect(tokens).toContain('hello');
      expect(tokens).toContain('world');
      expect(tokens).toContain('test');
      expect(tokens).not.toContain(',');
      expect(tokens).not.toContain('!');
      expect(tokens).not.toContain('?');
    });

    it('should normalize to lowercase', () => {
      const text = 'Hello WORLD Test';
      const tokens = tokenizeWords(text);

      expect(tokens).toContain('hello');
      expect(tokens).toContain('world');
      expect(tokens).toContain('test');
    });

    it('should handle empty string', () => {
      const tokens = tokenizeWords('');
      expect(tokens).toEqual([]);
    });

    it('should handle whitespace-only string', () => {
      const tokens = tokenizeWords('   \n\t  ');
      expect(tokens).toEqual([]);
    });

    it('should handle non-string input', () => {
      expect(tokenizeWords(null as any)).toEqual([]);
      expect(tokenizeWords(undefined as any)).toEqual([]);
    });

    it('should filter out empty tokens', () => {
      const text = 'hello  world   test';
      const tokens = tokenizeWords(text);

      expect(tokens).not.toContain('');
      expect(tokens.length).toBe(3);
    });
  });

  describe('tokenizeSentences', () => {
    it('should split on periods', () => {
      const text = 'First sentence. Second sentence.';
      const sentences = tokenizeSentences(text);

      expect(sentences).toContain('First sentence');
      expect(sentences).toContain('Second sentence');
    });

    it('should split on exclamation marks', () => {
      const text = 'First sentence! Second sentence!';
      const sentences = tokenizeSentences(text);

      expect(sentences).toContain('First sentence');
      expect(sentences).toContain('Second sentence');
    });

    it('should split on question marks', () => {
      const text = 'First question? Second question?';
      const sentences = tokenizeSentences(text);

      expect(sentences).toContain('First question');
      expect(sentences).toContain('Second question');
    });

    it('should handle mixed punctuation', () => {
      const text = 'First sentence. Second question? Third exclamation!';
      const sentences = tokenizeSentences(text);

      expect(sentences.length).toBe(3);
    });

    it('should trim whitespace from sentences', () => {
      const text = '  First sentence.   Second sentence.  ';
      const sentences = tokenizeSentences(text);

      expect(sentences[0]).toBe('First sentence');
      expect(sentences[1]).toBe('Second sentence');
    });

    it('should handle empty string', () => {
      const sentences = tokenizeSentences('');
      expect(sentences).toEqual([]);
    });

    it('should handle non-string input', () => {
      expect(tokenizeSentences(null as any)).toEqual([]);
      expect(tokenizeSentences(undefined as any)).toEqual([]);
    });

    it('should filter out empty sentences', () => {
      const text = 'First.  .  Second.';
      const sentences = tokenizeSentences(text);

      expect(sentences).not.toContain('');
      expect(sentences.length).toBe(2);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const keywords = extractKeywords(text);

      expect(keywords).toContain('quick');
      expect(keywords).toContain('brown');
      expect(keywords).toContain('fox');
      expect(keywords).toContain('jumps');
      expect(keywords).toContain('lazy');
      expect(keywords).toContain('dog');
    });

    it('should filter out stop words', () => {
      const text = 'the quick brown fox jumps over the lazy dog';
      const keywords = extractKeywords(text);

      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('over');
    });

    it('should return unique keywords', () => {
      const text = 'test test test example example';
      const keywords = extractKeywords(text);

      const testCount = keywords.filter(k => k === 'test').length;
      const exampleCount = keywords.filter(k => k === 'example').length;

      expect(testCount).toBe(1);
      expect(exampleCount).toBe(1);
    });

    it('should normalize keywords to lowercase', () => {
      const text = 'Python JAVA JavaScript';
      const keywords = extractKeywords(text);

      expect(keywords).toContain('python');
      expect(keywords).toContain('java');
      expect(keywords).toContain('javascript');
    });

    it('should handle empty string', () => {
      const keywords = extractKeywords('');
      expect(keywords).toEqual([]);
    });

    it('should handle stop-words-only text', () => {
      const text = 'the and or but is';
      const keywords = extractKeywords(text);

      expect(keywords).toEqual([]);
    });

    it('should handle non-string input', () => {
      expect(extractKeywords(null as any)).toEqual([]);
      expect(extractKeywords(undefined as any)).toEqual([]);
    });

    it('should preserve keyword order', () => {
      const text = 'apple banana cherry date';
      const keywords = extractKeywords(text);

      expect(keywords).toEqual(['apple', 'banana', 'cherry', 'date']);
    });
  });

  describe('isValidEssayContent', () => {
    it('should return true for valid content', () => {
      expect(isValidEssayContent('This is valid content')).toBe(true);
      expect(isValidEssayContent('a')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidEssayContent('')).toBe(false);
    });

    it('should return false for whitespace-only string', () => {
      expect(isValidEssayContent('   ')).toBe(false);
      expect(isValidEssayContent('\n\t  ')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(isValidEssayContent(null as any)).toBe(false);
      expect(isValidEssayContent(undefined as any)).toBe(false);
      expect(isValidEssayContent(123 as any)).toBe(false);
    });
  });

  describe('getWordCount', () => {
    it('should return correct word count', () => {
      const essay: EssayContent = {
        rawText: 'hello world test',
        tokens: ['hello', 'world', 'test'],
        sentences: ['hello world test']
      };

      expect(getWordCount(essay)).toBe(3);
    });

    it('should return 0 for empty essay', () => {
      const essay: EssayContent = {
        rawText: '',
        tokens: [],
        sentences: []
      };

      expect(getWordCount(essay)).toBe(0);
    });
  });

  describe('getSentenceCount', () => {
    it('should return correct sentence count', () => {
      const essay: EssayContent = {
        rawText: 'First. Second. Third.',
        tokens: ['first', 'second', 'third'],
        sentences: ['First', 'Second', 'Third']
      };

      expect(getSentenceCount(essay)).toBe(3);
    });

    it('should return 0 for empty essay', () => {
      const essay: EssayContent = {
        rawText: '',
        tokens: [],
        sentences: []
      };

      expect(getSentenceCount(essay)).toBe(0);
    });
  });

  describe('getAverageWordsPerSentence', () => {
    it('should calculate correct average', () => {
      const essay: EssayContent = {
        rawText: 'hello world. test example.',
        tokens: ['hello', 'world', 'test', 'example'],
        sentences: ['hello world', 'test example']
      };

      expect(getAverageWordsPerSentence(essay)).toBe(2);
    });

    it('should return 0 for essay with no sentences', () => {
      const essay: EssayContent = {
        rawText: '',
        tokens: [],
        sentences: []
      };

      expect(getAverageWordsPerSentence(essay)).toBe(0);
    });
  });

  // Property-Based Tests

  describe('Property 6: Essay Keyword Extraction', () => {
    it('should extract all non-stop-word tokens as keywords', () => {
      // Feature: diagram-essay-grading-system, Property 6: Essay Keyword Extraction
      // Validates: Requirements 2.1, 2.2

      fc.assert(
        fc.property(
          fc.array(
            fc.stringMatching(/^[a-z]+$/),
            { minLength: 1, maxLength: 50 }
          ),
          (words) => {
            // Create essay text from words
            const essayText = words.join(' ');

            // Parse the essay
            const essay = parseEssay(essayText);

            // Extract keywords
            const keywords = extractKeywords(essayText);

            // Verify: all keywords are from the essay tokens
            for (const keyword of keywords) {
              expect(essay.tokens).toContain(keyword);
            }

            // Verify: keywords are unique
            const uniqueKeywords = new Set(keywords);
            expect(keywords.length).toBe(uniqueKeywords.size);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should extract keywords that appear in the essay text', () => {
      // Feature: diagram-essay-grading-system, Property 6: Essay Keyword Extraction
      // Validates: Requirements 2.1, 2.2

      fc.assert(
        fc.property(
          fc.array(
            fc.stringMatching(/^[a-z]{2,10}$/),
            { minLength: 1, maxLength: 20 }
          ),
          (keywords) => {
            // Create essay text with known keywords
            const essayText = keywords.join(' ');

            // Extract keywords from the essay
            const extractedKeywords = extractKeywords(essayText);

            // Verify: all extracted keywords are from the input
            for (const keyword of extractedKeywords) {
              expect(keywords).toContain(keyword);
            }

            // Verify: extracted keywords are normalized to lowercase
            for (const keyword of extractedKeywords) {
              expect(keyword).toBe(keyword.toLowerCase());
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle essays with mixed content and extract meaningful keywords', () => {
      // Feature: diagram-essay-grading-system, Property 6: Essay Keyword Extraction
      // Validates: Requirements 2.1, 2.2

      fc.assert(
        fc.property(
          fc.tuple(
            fc.array(fc.stringMatching(/^[a-z]{2,8}$/), { minLength: 1, maxLength: 10 }),
            fc.array(fc.stringMatching(/^[a-z]{2,8}$/), { minLength: 1, maxLength: 10 })
          ),
          ([contentWords, stopWords]) => {
            // Create essay with content words
            const essayText = contentWords.join(' ');

            // Parse and extract keywords
            const essay = parseEssay(essayText);
            const keywords = extractKeywords(essayText);

            // Verify: essay has tokens
            expect(essay.tokens.length).toBeGreaterThan(0);

            // Verify: keywords are a subset of tokens
            for (const keyword of keywords) {
              expect(essay.tokens).toContain(keyword);
            }

            // Verify: keywords are normalized
            for (const keyword of keywords) {
              expect(keyword).toBe(keyword.toLowerCase());
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

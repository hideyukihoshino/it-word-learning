'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { terms, CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/terms'

export default function Home() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [awsOnly, setAwsOnly] = useState(false)

  // 検索・フィルター処理
  const filtered = useMemo(() => {
    return terms.filter((t) => {
      const q = query.toLowerCase()
      const matchQuery =
        q === '' ||
        t.term.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.reading && t.reading.includes(q))
      const matchCategory = !selectedCategory || t.category === selectedCategory
      const matchAws = !awsOnly || t.awsExam
      return matchQuery && matchCategory && matchAws
    })
  }, [query, selectedCategory, awsOnly])

  const handleCategory = (cat: string | null) => {
    setSelectedCategory(cat)
    setAwsOnly(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* ヘッダー・検索・フィルター（固定） */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '12px 16px 0' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
            📚 ARI用語ノート
          </h1>

          {/* 検索バー */}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="用語を検索..."
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '10px',
            }}
          />

          {/* カテゴリフィルター（横スクロール） */}
          <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
              <button
                onClick={() => handleCategory(null)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: !selectedCategory && !awsOnly ? '#1e293b' : '#e2e8f0',
                  color: !selectedCategory && !awsOnly ? '#ffffff' : '#475569',
                }}
              >
                全部
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    backgroundColor: selectedCategory === cat ? '#1e293b' : '#e2e8f0',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
              <button
                onClick={() => { setSelectedCategory(null); setAwsOnly(!awsOnly) }}
                style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: awsOnly ? '#ea580c' : '#fff7ed',
                  color: awsOnly ? '#ffffff' : '#c2410c',
                }}
              >
                ★ AWS試験
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 用語リスト */}
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
          {filtered.length}件
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((term) => {
            const colors = CATEGORY_COLORS[term.category]
            const preview = term.description.split('\n')[0]
            const shortDesc = preview.length > 55 ? preview.slice(0, 55) + '…' : preview
            return (
              <Link key={term.id} href={`/terms/${term.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '14px 16px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>
                      {term.term}
                    </span>
                    {term.awsExam && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#fff7ed', color: '#c2410c', fontWeight: '600' }}>
                        ★AWS
                      </span>
                    )}
                  </div>
                  {term.reading && (
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{term.reading}</p>
                  )}
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', lineHeight: '1.5' }}>
                    {shortDesc}
                  </p>
                  <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '9999px', backgroundColor: colors.bg, color: colors.text, fontWeight: '500' }}>
                    {CATEGORY_LABELS[term.category]}
                  </span>
                </div>
              </Link>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0', fontSize: '14px' }}>
              「{query}」に一致する用語が見つかりませんでした
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

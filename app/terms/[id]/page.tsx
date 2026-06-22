import Link from 'next/link'
import { getTermById, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/terms'
import { notFound } from 'next/navigation'

// Next.js 16: params は Promise型
export default async function TermPage(props: PageProps<'/terms/[id]'>) {
  const { id } = await props.params
  const term = getTermById(id)

  if (!term) {
    notFound()
  }

  const colors = CATEGORY_COLORS[term.category]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* ヘッダー */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: '14px',
              color: '#64748b',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← 戻る
          </Link>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>ARI用語ノート</span>
        </div>
      </header>

      {/* コンテンツ */}
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
          }}
        >
          {/* 用語名 + バッジ */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                {term.term}
              </h1>
              {term.awsExam && (
                <span
                  style={{
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: '#fff7ed',
                    color: '#c2410c',
                    fontWeight: 'bold',
                  }}
                >
                  ★ AWS試験
                </span>
              )}
            </div>

            {/* 読み方 */}
            {term.reading && (
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 10px' }}>
                {term.reading}
              </p>
            )}

            {/* カテゴリバッジ */}
            <span
              style={{
                display: 'inline-block',
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontWeight: '500',
              }}
            >
              {CATEGORY_LABELS[term.category]}
            </span>
          </div>

          {/* 区切り線 */}
          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '16px 0' }} />

          {/* 説明文 */}
          <div style={{ marginBottom: term.awsExam && term.examPoint ? '20px' : '0' }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#94a3b8',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              説明
            </p>
            <p
              style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.8',
                whiteSpace: 'pre-line',
                margin: 0,
              }}
            >
              {term.description}
            </p>
          </div>

          {/* AWS試験ポイント */}
          {term.awsExam && term.examPoint && (
            <div
              style={{
                backgroundColor: '#fff7ed',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #fed7aa',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#ea580c',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                🎯 AWS試験ポイント
              </p>
              <p
                style={{
                  fontSize: '14px',
                  color: '#9a3412',
                  lineHeight: '1.7',
                  margin: 0,
                }}
              >
                {term.examPoint}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

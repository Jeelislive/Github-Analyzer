  "use client"

type Props = {
  src: string
  size?: number
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export default function DotLottieIcon({ src, size = 22, className = "", loop = true, autoplay = true }: Props) {
  const isDotLottie = src.toLowerCase().endsWith('.lottie')

  return (
    <div
      className={className}
      style={{ width: size, height: size, display: "inline-block" }}
      aria-hidden="true"
    >
      {isDotLottie ? (
        // @ts-ignore - web component provided by dotlottie-wc script
        <dotlottie-wc
          src={src}
          style={{ width: size, height: size }}
          {...(loop ? { loop: true } : {})}
          {...(autoplay ? { autoplay: true } : {})}
        />
      ) : (
        // @ts-ignore - web component provided by lottie-player script
        <lottie-player
          src={src}
          background="transparent"
          speed="1"
          style={{ width: size, height: size }}
          {...(loop ? { loop: true } : {})}
          {...(autoplay ? { autoplay: true } : {})}
        />
      )}
    </div>
  )
}

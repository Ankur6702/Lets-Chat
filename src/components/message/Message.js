import "./message.css"

export default function Message({ own, message, name, date }) {
  return (
    <div className={own ? "message own" : "message"}>
        <div className="messageTop">
            <p className="messageText">
                <span dangerouslySetInnerHTML={{ __html: message }} />
            </p>
        </div>
        <div className="messageBottom">
            <b>{name}</b> at <span>{date}</span>
        </div>
    </div>
  )
}

export default function Success() {
  return (
    <div className="mx-auto mt-24 max-w-xl rounded-2xl border p-6 text-center">
      <h1 className="mb-2 text-xl font-semibold">Оплата принята</h1>
      <p>Подписка активируется автоматически в течение минуты. Можно обновить страницу.</p>
      <a className="mt-4 inline-block rounded-xl bg-pink-500 px-4 py-2 text-white" href="/">Вернуться на главную</a>
    </div>
  );
}

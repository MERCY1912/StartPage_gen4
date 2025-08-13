export default function Fail() {
  return (
    <div className="mx-auto mt-24 max-w-xl rounded-2xl border p-6 text-center">
      <h1 className="mb-2 text-xl font-semibold">Оплата не прошла</h1>
      <p>Попробуйте ещё раз или выберите другой способ позже.</p>
      <a className="mt-4 inline-block rounded-xl bg-gray-200 px-4 py-2" href="/">Назад</a>
    </div>
  );
}

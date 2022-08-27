<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let total = 0;
  export let pageSize = 0;
  export let currentPage = 1;

  function setPage(d) {
    currentPage = currentPage + d;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const max = Math.ceil(total / pageSize);
    if (currentPage >= max) {
      currentPage = max;
    }
    dispatch("update");
  }
</script>

{#if total != 0 && total > pageSize}
  <div class="ui-btn-group">
    <button
      class="ui-btn ui-btn-square ui-btn-xs"
      on:click={(_) => setPage(-1)}
      class:ui-btn-disabled={currentPage == 1}>«</button
    >

    <button
      class="ui-btn ui-btn-square ui-btn-xs ui-btn-ghost"
      on:click={(_) => setPage(1 - currentPage)}
      >{currentPage}/{Math.ceil(total / pageSize)}</button
    >

    <button class="ui-btn ui-btn-square ui-btn-xs" on:click={(_) => setPage(+1)}
      >»</button
    >
  </div>
{/if}
